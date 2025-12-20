import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox'; // [MỚI]
import { MatDividerModule } from '@angular/material/divider'; // [MỚI]
import { 
  UserManagementService, 
  StaffCreateDto, 
  RoleDto, 
  BuildingDto, 
  UserAccountDto 
} from '../../../../../services/management/user-management.service';

@Component({
  selector: 'app-create-staff',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './create-staff.component.html',
  styleUrls: ['./create-staff.component.css']
})
export class CreateStaffComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserManagementService);
  private dialogRef = inject(MatDialogRef<CreateStaffComponent>);
  private snackBar = inject(MatSnackBar);
  
  // [MỚI] Nhận dữ liệu truyền vào dialog (nếu có user -> Edit Mode)
  public data = inject<{ staff?: UserAccountDto }>(MAT_DIALOG_DATA, { optional: true });

  staffForm: FormGroup;
  isSubmitting = false;
  isEditMode = false; // Cờ kiểm tra chế độ

  roles: RoleDto[] = [];
  buildings: BuildingDto[] = []; // Danh sách tất cả tòa nhà

  constructor() {
    // Kiểm tra xem có dữ liệu user truyền vào không
    this.isEditMode = !!this.data?.staff;

    this.staffForm = this.fb.group({
      fullName: [{ value: '', disabled: this.isEditMode }, [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: this.isEditMode }, [Validators.required, Validators.email]],
      phone: [{ value: '', disabled: this.isEditMode }, [Validators.required, Validators.pattern('^[0-9]{9,11}$')]],
      roleId: [{ value: '', disabled: this.isEditMode }, Validators.required],
      staffCode: [{ value: '', disabled: this.isEditMode }],
      // [MỚI] FormArray cho checkbox tòa nhà
      selectedBuildings: this.fb.array([]) 
    });
  }

  ngOnInit(): void {
    // Load dữ liệu nền
    this.loadRoles();
    this.loadBuildings();
  }

  loadRoles() {
    this.userService.getRolesForManager().subscribe(res => {
      if (res.succeeded) {
        this.roles = res.data.filter((r: RoleDto) => 
          !['resident', 'admin', 'manager'].includes(r.roleName.toLowerCase()) || 
          r.roleName.toLowerCase().includes('staff')
        );
        
        // Nếu Edit Mode, set giá trị Role
        if (this.isEditMode && this.data?.staff) {
          // Cần map RoleName sang RoleId. 
          // Do Backend UserDto trả về RoleName, ta phải tìm RoleId tương ứng trong list roles vừa load.
          const matchingRole = this.roles.find(r => r.roleName === this.data!.staff!.roleName);
          if (matchingRole) {
            this.staffForm.patchValue({ roleId: matchingRole.roleId });
          }
        }
      }
    });
  }

  loadBuildings() {
  // Gọi qua UserManagementService thay vì BuildingService
  this.userService.getManagedBuildings().subscribe(res => {
    if (res.succeeded) {
      // Dữ liệu trả về giờ chỉ là những building manager này có quyền
      this.buildings = res.data; 
      this.initBuildingCheckboxes();
    }
  });
}

  initBuildingCheckboxes() {
    const formArray = this.staffForm.get('selectedBuildings') as FormArray;
  formArray.clear();

  this.buildings.forEach(b => {
    let isChecked = false;
    
    // [SỬA ĐỔI] Dùng assignedBuildingIds để so sánh với b.buildingId
    if (this.isEditMode && this.data?.staff?.assignedBuildingIds) {
      isChecked = this.data.staff.assignedBuildingIds.includes(b.buildingId);
    }

    formArray.push(new FormControl(isChecked));
  });

    // Nếu Edit Mode, fill các thông tin text
    if (this.isEditMode && this.data?.staff) {
      const s = this.data.staff;
      this.staffForm.patchValue({
        fullName: s.name,
        email: s.email,
        phone: s.phone,
        staffCode: s.staffCode
      });
    }
  }

  // Helper lấy FormArray để dùng trong template
  get buildingControls() {
    return (this.staffForm.get('selectedBuildings') as FormArray).controls;
  }

  // [MỚI] Hàm Reset Password
  onResetPassword() {
    if (!this.isEditMode || !this.data?.staff) return;
    
    if (confirm(`Bạn có chắc muốn đặt lại mật khẩu cho nhân viên ${this.data.staff.name}? Mật khẩu mới sẽ được gửi qua email.`)) {
      this.isSubmitting = true;
      this.userService.resetPasswordByAdmin(this.data.staff.userId).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.succeeded) {
            this.snackBar.open('Đã reset mật khẩu thành công.', 'Đóng', { duration: 3000 });
          } else {
            this.snackBar.open(res.message, 'Đóng', { duration: 3000 });
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.snackBar.open('Lỗi khi reset mật khẩu.', 'Đóng', { duration: 3000 });
        }
      });
    }
  }

  // Helper tạo mật khẩu ngẫu nhiên (chỉ dùng khi Tạo mới)
  private generateRandomPassword(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  onSubmit() {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    
    // Lấy danh sách ID các tòa nhà được chọn
    const selectedBuildingIds = this.staffForm.value.selectedBuildings
      .map((checked: boolean, index: number) => checked ? this.buildings[index].buildingId : null)
      .filter((id: string | null) => id !== null);

    if (this.isEditMode) {
      // --- LOGIC EDIT MODE ---
      // Chỉ gọi API Update Assignment
      const staffId = this.data!.staff!.userId;
      
      this.userService.updateStaffAssignments(staffId, selectedBuildingIds, "Cập nhật quản lý").subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.succeeded) {
            this.snackBar.open('Cập nhật cấu hình thành công', 'Đóng', { duration: 3000 });
            this.dialogRef.close(true);
          } else {
            this.snackBar.open(res.message, 'Đóng', { duration: 3000 });
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.snackBar.open('Lỗi cập nhật.', 'Đóng', { duration: 3000 });
        }
      });

    } else {
      // --- LOGIC CREATE MODE ---
      // 1. Tạo User trước
      const formValue = this.staffForm.value;
      const randomPassword = this.generateRandomPassword(6);

      const createDto: StaffCreateDto = {
        name: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        password: randomPassword,
        roleId: formValue.roleId,
        staffCode: formValue.staffCode
      };

      this.userService.createStaffAccount(createDto).subscribe({
        next: (res) => {
          if (res.succeeded) {
            const newUserId = res.data.userId;
            
            // 2. Nếu tạo user thành công -> Gọi tiếp API gán tòa nhà (nếu có chọn tòa)
            if (selectedBuildingIds.length > 0) {
              this.userService.updateStaffAssignments(newUserId, selectedBuildingIds, "Khởi tạo").subscribe({
                next: () => {
                  this.isSubmitting = false;
                  this.snackBar.open('Tạo nhân viên và phân công thành công', 'Đóng', { duration: 3000 });
                  this.dialogRef.close(true);
                },
                error: () => {
                  // User tạo rồi nhưng gán lỗi -> Vẫn đóng dialog nhưng báo warning
                  this.isSubmitting = false;
                  this.snackBar.open('Tạo nhân viên thành công nhưng lỗi phân công.', 'Đóng', { duration: 5000 });
                  this.dialogRef.close(true); 
                }
              });
            } else {
              this.isSubmitting = false;
              this.snackBar.open('Tạo nhân viên thành công', 'Đóng', { duration: 3000 });
              this.dialogRef.close(true);
            }

          } else {
            this.isSubmitting = false;
            this.snackBar.open(res.message, 'Đóng', { duration: 3000 });
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          const msg = err.error?.message || 'Lỗi hệ thống';
          this.snackBar.open(msg, 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }
}