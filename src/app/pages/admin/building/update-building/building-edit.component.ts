import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core'; // Thêm ViewChild, TemplateRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BuildingService, BuildingDto, BuildingDetailResponse, BuildingBasicResponse } from '../../../../services/admin/building.service';
import { ProjectService } from '../../../../services/admin/project.service';
// [QUAN TRỌNG] Thêm các import cho Dialog và Icon
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-building-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatDialogModule, // Thêm Module này
    MatIconModule    // Thêm Module này
  ],
  templateUrl: './building-edit.component.html',
  styleUrls: ['./building-edit.component.css']
})
export class BuildingEditComponent implements OnInit {
  editForm: FormGroup;
  buildingId: string = '';
  currentBuilding: BuildingDto | null = null;
  projectName: string = 'Đang tải...';
  
  isLoading = false; 
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // [MỚI] Biến để xử lý Dialog
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog // Inject MatDialog
  ) {
    this.editForm = this.fb.group({
      buildingCode: [{value: '', disabled: true}],
      name: ['', Validators.required],
      // [CHÚ Ý] Đã xóa isActive khỏi form vì xử lý riêng
      totalFloors: [1, [Validators.required, Validators.min(1), Validators.max(200)]],
      totalBasements: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      totalArea: [null, [Validators.min(0)]],
      handoverDate: [null],
      description: [''],
      receptionPhone: ['', [Validators.pattern('^[0-9]*$'), Validators.minLength(8), Validators.maxLength(15)]],
      readingWindowStart: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      readingWindowEnd: [5, [Validators.required, Validators.min(1), Validators.max(31)]]
    });
  }

  ngOnInit(): void {
    this.buildingId = this.route.snapshot.paramMap.get('id') || '';
    if (this.buildingId) {
      this.loadBuilding();
    }
  }

  loadBuilding() {
    this.isLoading = true;
    this.buildingService.getBuildingById(this.buildingId).subscribe({
      next: (res: BuildingDetailResponse) => {
        if (res.succeeded && res.data) {
          this.currentBuilding = res.data;
          // Patch value nhưng KHÔNG patch isActive (vì đã bỏ khỏi form)
          this.editForm.patchValue(this.currentBuilding);
          this.loadProjectName(res.data.projectId);
        } else {
          this.errorMessage = 'Không tìm thấy tòa nhà.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Lỗi khi tải dữ liệu.';
        this.isLoading = false;
      }
    });
  }

  loadProjectName(projectId: string) {
    if (!projectId) return;
    this.projectService.getProjectById(projectId).subscribe({
      next: (res) => {
        if (res.succeeded && res.data) {
          this.projectName = `${res.data.name} (${res.data.projectCode})`;
        } else {
          this.projectName = 'Không xác định';
        }
      },
      error: () => {
        this.projectName = 'Lỗi tải tên dự án';
      }
    });
  }

  // [MỚI] Hàm xử lý click nút Dừng/Kích hoạt
  onToggleStatus() {
    if (!this.currentBuilding) return;

    if (this.currentBuilding.isActive) {
      // Nếu đang Active -> Muốn Dừng -> Hiện Dialog cảnh báo
      this.dialog.open(this.confirmDialog, {
        width: '400px',
        disableClose: true,
        panelClass: 'dialog-no-radius' // Class để bỏ bo góc (nếu đã config global)
      });
    } else {
      // Nếu đang Inactive -> Muốn Kích hoạt -> Làm luôn
      this.executeUpdateStatus(true);
    }
  }

  // [MỚI] Hàm gọi API cập nhật trạng thái
  executeUpdateStatus(newStatus: boolean) {
    this.isLoading = true;
    // Gọi API update chỉ với trường isActive
    this.buildingService.updateBuilding(this.buildingId, { isActive: newStatus }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.succeeded) {
          if (this.currentBuilding) this.currentBuilding.isActive = newStatus;
          this.successMessage = newStatus ? 'Đã kích hoạt tòa nhà.' : 'Đã ngưng hoạt động tòa nhà.';
          // Tự tắt thông báo sau 3s
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = res.message || 'Lỗi cập nhật trạng thái.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi hệ thống khi cập nhật trạng thái.';
      }
    });
  }

  onSubmit() {
    if (this.editForm.invalid) {
        this.editForm.markAllAsTouched();
        return;
    }

    const formValue = this.editForm.getRawValue();
    if (formValue.readingWindowStart >= formValue.readingWindowEnd) {
        this.errorMessage = 'Ngày bắt đầu chốt số phải nhỏ hơn ngày kết thúc.';
        return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const updateDto = {
      name: formValue.name,
      // [CHÚ Ý] Không gửi isActive ở đây nữa, giữ nguyên giá trị hiện tại hoặc null
      // Backend sẽ bỏ qua nếu null, hoặc ta có thể gửi giá trị hiện tại của currentBuilding
      // Nhưng an toàn nhất là để logic Status xử lý riêng.
      totalFloors: formValue.totalFloors,
      totalBasements: formValue.totalBasements,
      totalArea: formValue.totalArea,
      handoverDate: formValue.handoverDate,
      description: formValue.description,
      receptionPhone: formValue.receptionPhone,
      readingWindowStart: formValue.readingWindowStart,
      readingWindowEnd: formValue.readingWindowEnd
    };

    this.buildingService.updateBuilding(this.buildingId, updateDto).subscribe({
      next: (res: BuildingBasicResponse) => {
        this.isSubmitting = false;
        if (res.succeeded) {
          this.successMessage = 'Cập nhật thông tin thành công!';
          setTimeout(() => this.router.navigate(['/admin/building/list']), 1500);
        } else {
          this.errorMessage = res.message || 'Lỗi cập nhật.';
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Lỗi hệ thống.';
      }
    });
  }
}