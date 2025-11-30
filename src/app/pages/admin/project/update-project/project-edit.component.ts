import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService, ProjectDto, ProjectDetailResponse, ProjectBasicResponse } from '../../../../services/admin/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css']
})
export class ProjectEditComponent implements OnInit {
  editForm: FormGroup;
  projectId: string = '';
  currentProject: ProjectDto | null = null;
  isSubmitting = false;
  isLoading = false;
  isValidatingPayOS = false;
  payOSValidationMessage = '';
  payOSValidationStatus: 'idle' | 'valid' | 'invalid' = 'idle';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar // Inject SnackBar
  ) {
    this.editForm = this.fb.group({
      // Readonly
      projectCode: [{value: '', disabled: true}],
      
      // Editable
      name: ['', [Validators.required, Validators.minLength(3)]],
      isActive: [true],
      
      address: [''],
      ward: [''],
      district: [''],
      city: [''],
      
      bankName: [''],
      bankAccountNumber: ['', [Validators.pattern('^[0-9]+$')]],
      bankAccountName: [''],
      
      // PayOS Settings
      payOSClientId: [''],
      payOSApiKey: [''],
      payOSChecksumKey: ['']
    });
  }

  ngOnInit(): void {
    // Set bankName mặc định là "PayOS"
    this.editForm.patchValue({
      bankName: 'PayOS'
    });
    // Disable bankName field
    this.editForm.get('bankName')?.disable();

    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadProject();
    }
  }

  loadProject() {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (res: ProjectDetailResponse) => {
        if (res.succeeded && res.data) {
          this.currentProject = res.data;
          this.editForm.patchValue(this.currentProject);
          
          // Nếu đã có PayOS credentials và bank account info, set validation status và disable fields
          if (this.currentProject.payOSClientId && this.currentProject.bankAccountNumber) {
            this.payOSValidationStatus = 'valid';
            this.payOSValidationMessage = '✓ Tài khoản PayOS đã được cấu hình';
            this.editForm.get('bankAccountNumber')?.disable();
            this.editForm.get('bankAccountName')?.disable();
          }
        } else {
          this.showNotification('Không tìm thấy dự án.', 'error');
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Lỗi khi tải dữ liệu dự án.', 'error');
        this.isLoading = false;
      }
    });
  }

  // Reset PayOS validation khi user thay đổi input
  resetPayOSValidation() {
    // Chỉ reset nếu đã có validation status (đã click nút kiểm tra)
    if (this.payOSValidationStatus !== 'idle') {
      this.payOSValidationStatus = 'idle';
      this.payOSValidationMessage = '';
      // Enable lại 2 trường bank account khi reset
      this.editForm.get('bankAccountNumber')?.enable();
      this.editForm.get('bankAccountName')?.enable();
      // Clear giá trị
      this.editForm.patchValue({
        bankAccountNumber: '',
        bankAccountName: ''
      });
    }
  }

  // Validate PayOS credentials - chỉ chạy khi user click nút
  validatePayOS() {
    const clientId = this.editForm.get('payOSClientId')?.value;
    const apiKey = this.editForm.get('payOSApiKey')?.value;
    const checksumKey = this.editForm.get('payOSChecksumKey')?.value;

    // Nếu không có PayOS settings, bỏ qua validation
    if (!clientId && !apiKey && !checksumKey) {
      this.payOSValidationStatus = 'idle';
      this.payOSValidationMessage = '';
      return;
    }

    // Kiểm tra có đủ 3 trường không
    if (!clientId || !apiKey || !checksumKey) {
      this.payOSValidationStatus = 'invalid';
      this.payOSValidationMessage = 'Vui lòng nhập đầy đủ 3 thông tin PayOS (Client ID, API Key, Checksum Key)';
      return;
    }

    this.isValidatingPayOS = true;
    this.payOSValidationMessage = 'Đang kiểm tra...';
    this.payOSValidationStatus = 'idle';

    this.projectService.validatePayOSCredentials(clientId, apiKey, checksumKey).subscribe({
      next: (res: any) => {
        this.isValidatingPayOS = false;
        if (res.succeeded && res.data?.isValid) {
          this.payOSValidationStatus = 'valid';
          this.payOSValidationMessage = '✓ Tài khoản PayOS hợp lệ';
          
          // Tự động điền thông tin ngân hàng từ PayOS response
          if (res.data?.accountNumber) {
            this.editForm.patchValue({
              bankAccountNumber: res.data.accountNumber
            });
            // Disable trường số tài khoản sau khi điền
            this.editForm.get('bankAccountNumber')?.disable();
          }
          if (res.data?.accountName) {
            this.editForm.patchValue({
              bankAccountName: res.data.accountName
            });
            // Disable trường tên chủ tài khoản sau khi điền
            this.editForm.get('bankAccountName')?.disable();
          }
        } else {
          this.payOSValidationStatus = 'invalid';
          this.payOSValidationMessage = res.data?.message || 'Tài khoản PayOS không hợp lệ';
        }
      },
      error: (err: any) => {
        this.isValidatingPayOS = false;
        this.payOSValidationStatus = 'invalid';
        this.payOSValidationMessage = err.error?.message || 'Lỗi khi kiểm tra tài khoản PayOS';
      }
    });
  }

  onSubmit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    // Kiểm tra PayOS validation nếu có nhập PayOS settings
    const hasPayOS = this.editForm.get('payOSClientId')?.value || 
                     this.editForm.get('payOSApiKey')?.value || 
                     this.editForm.get('payOSChecksumKey')?.value;

    if (hasPayOS && this.payOSValidationStatus !== 'valid') {
      this.showNotification('Vui lòng kiểm tra và xác thực tài khoản PayOS trước khi cập nhật dự án', 'error');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.editForm.getRawValue();
    // Đảm bảo bankName luôn là "PayOS" nếu có PayOS credentials
    if (hasPayOS) {
      formValue.bankName = 'PayOS';
    }
    
    const updateDto = {
      name: formValue.name,
      isActive: formValue.isActive,
      address: formValue.address,
      ward: formValue.ward,
      district: formValue.district,
      city: formValue.city,
      bankName: formValue.bankName,
      bankAccountNumber: formValue.bankAccountNumber,
      bankAccountName: formValue.bankAccountName,
      payOSClientId: formValue.payOSClientId,
      payOSApiKey: formValue.payOSApiKey,
      payOSChecksumKey: formValue.payOSChecksumKey
    };

    this.projectService.updateProject(this.projectId, updateDto).subscribe({
      next: (res: ProjectBasicResponse) => {
        this.isSubmitting = false;
        if (res.succeeded) {
          this.showNotification('Cập nhật thành công!', 'success');
          setTimeout(() => this.router.navigate(['/admin/project/list']), 1500);
        } else {
          this.showNotification(res.message || 'Lỗi cập nhật.', 'error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Lỗi hệ thống.';
        this.showNotification(msg, 'error');
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['mat-toolbar', 'mat-primary'] : ['mat-toolbar', 'mat-warn']
    });
  }
}