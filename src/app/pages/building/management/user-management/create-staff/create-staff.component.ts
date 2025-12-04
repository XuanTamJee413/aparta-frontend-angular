import { Component, OnInit, inject } from '@angular/core'; // Thêm OnInit
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { UserManagementService, StaffCreateDto, RoleDto } from '../../../../../services/management/user-management.service';

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
    MatSnackBarModule
  ],
  templateUrl: './create-staff.component.html',
  styleUrls: ['./create-staff.component.css']
})
export class CreateStaffComponent implements OnInit { // Implement OnInit
  private fb = inject(FormBuilder);
  private userService = inject(UserManagementService);
  private dialogRef = inject(MatDialogRef<CreateStaffComponent>);
  private snackBar = inject(MatSnackBar);

  staffForm: FormGroup;
  isSubmitting = false;
  hidePassword = true;

  // [SỬA] Không hardcode nữa, dùng mảng rỗng để hứng dữ liệu API
  roles: RoleDto[] = [];

  constructor() {
    this.staffForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,11}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleId: ['', Validators.required], // Giá trị này sẽ là GUID từ API
      staffCode: ['']
    });
  }

  // [MỚI] Gọi API lấy Role khi dialog mở
  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.userService.getAllRoles().subscribe({
      next: (res) => {
        if (res.succeeded) {
          // Lọc bỏ Role "Resident" và "Admin" nếu không muốn cho phép tạo ở đây
          this.roles = res.data.filter(r => 
            r.roleName.toLowerCase() !== 'resident' && 
            r.roleName.toLowerCase() !== 'admin'
          );
        }
      },
      error: (err) => {
        console.error('Lỗi tải roles:', err);
        this.snackBar.open('Không thể tải danh sách chức vụ.', 'Đóng', { duration: 3000 });
      }
    });
  }

  onSubmit() {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.staffForm.value;

    const dto: StaffCreateDto = {
      name: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      password: formValue.password,
      roleId: formValue.roleId, // Đây giờ là GUID thực sự
      staffCode: formValue.staffCode
    };

    this.userService.createStaffAccount(dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.succeeded) {
          this.dialogRef.close(true);
        } else {
          this.snackBar.open(res.message || 'Tạo thất bại', 'Đóng', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        // Xử lý thông báo lỗi chi tiết từ Backend trả về
        const msg = err.error?.message || err.message || 'Lỗi hệ thống';
        this.snackBar.open(msg, 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
}