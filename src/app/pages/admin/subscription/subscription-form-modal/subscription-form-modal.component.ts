import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { 
  SubscriptionService, 
  SubscriptionDto, 
  SubscriptionCreateOrUpdateDto 
} from '../../../../services/admin/subscription.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-subscription-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './subscription-form-modal.component.html',
  styleUrls: ['./subscription-form-modal.component.css']
})
export class SubscriptionFormModalComponent implements OnInit {
  subscriptionForm: FormGroup;
  projects: ProjectDto[] = [];
  isSubmitting = false;
  isLoadingProjects = false;
  mode: 'create' | 'edit' | 'view' = 'create';
  subscription: SubscriptionDto | null = null;

  paymentMethodOptions = [
    { value: 'Tiền mặt', label: 'Tiền mặt' },
    { value: 'Chuyển khoản', label: 'Chuyển khoản' },
    { value: 'Khác', label: 'Khác' }
  ];

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<SubscriptionFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit' | 'view', subscription: SubscriptionDto | null }
  ) {
    this.mode = data.mode;
    this.subscription = data.subscription;

    this.subscriptionForm = this.fb.group({
      projectId: [{ value: '', disabled: this.mode === 'edit' || this.mode === 'view' }, [Validators.required]],
      subscriptionCode: [{ value: '', disabled: this.mode === 'view' }, [Validators.required]],
      numMonths: [{ value: 1, disabled: this.mode === 'view' }, [Validators.required, Validators.min(1)]],
      amount: [{ value: 0, disabled: this.mode === 'view' }, [Validators.required, Validators.min(0)]],
      amountPaid: [{ value: null, disabled: this.mode === 'view' }],
      paymentMethod: [{ value: '', disabled: this.mode === 'view' }],
      paymentDate: [{ value: null, disabled: this.mode === 'view' }],
      paymentNote: [{ value: '', disabled: this.mode === 'view' }]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    
    if (this.subscription && (this.mode === 'edit' || this.mode === 'view')) {
      this.subscriptionForm.patchValue({
        projectId: this.subscription.projectId,
        subscriptionCode: this.subscription.subscriptionCode,
        numMonths: this.subscription.numMonths,
        amount: this.subscription.amount,
        amountPaid: this.subscription.amountPaid,
        paymentMethod: this.subscription.paymentMethod,
        paymentDate: this.subscription.paymentDate,
        paymentNote: this.subscription.paymentNote
      });
    }

    // Auto-suggest subscription code when project is selected
    this.setupSubscriptionCodeSuggestion();
  }

  private setupSubscriptionCodeSuggestion(): void {
    if (this.mode === 'view') return; // Don't suggest in view mode

    this.subscriptionForm.get('projectId')?.valueChanges.subscribe(projectId => {
      // Auto-generate subscription code whenever project changes
      if (projectId) {
        const project = this.projects.find(p => p.projectId === projectId);
        if (project && project.projectCode) {
          const suggestedCode = this.generateSubscriptionCode(project.projectCode);
          this.subscriptionForm.patchValue({ subscriptionCode: suggestedCode });
        }
      }
    });
  }

  private generateSubscriptionCode(projectCode: string): string {
    // Extract only alphanumeric characters from project code
    const cleanProjectCode = projectCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Generate timestamp (YYYYMMDDHHmmss)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
    
    return `${cleanProjectCode}${timestamp}`;
  }

  loadProjects(): void {
    this.isLoadingProjects = true;
    this.projectService.getAllProjects({ isActive: true }).subscribe({
      next: (response) => {
        this.isLoadingProjects = false;
        if (response.succeeded && response.data) {
          this.projects = response.data;
        }
      },
      error: (error) => {
        this.isLoadingProjects = false;
        console.error('Error loading projects:', error);
        this.showError('Không thể tải danh sách dự án');
      }
    });
  }

  getTitle(): string {
    if (this.mode === 'view') return 'Xem Gia hạn Gói dịch vụ';
    if (this.mode === 'edit') return 'Chỉnh sửa Gia hạn Gói dịch vụ';
    return 'Thêm mới Gia hạn Gói dịch vụ';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subscriptionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.subscriptionForm.get(fieldName);
    if (field?.hasError('required')) {
      return this.getRequiredMessage(fieldName);
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} phải lớn hơn 0`;
    }
    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      projectId: 'Vui lòng chọn dự án.',
      subscriptionCode: 'Vui lòng nhập mã gói.',
      numMonths: 'Số tháng phải lớn hơn 0.',
      amount: 'Vui lòng nhập giá gốc.',
      amountPaid: 'Vui lòng nhập số tiền.',
      paymentMethod: 'Vui lòng nhập phương thức thanh toán.',
      paymentDate: 'Vui lòng chọn ngày thanh toán.'
    };
    return messages[fieldName] || `${this.getFieldLabel(fieldName)} là bắt buộc`;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      projectId: 'Dự án',
      subscriptionCode: 'Mã gói',
      numMonths: 'Số tháng',
      amount: 'Giá gốc gói',
      amountPaid: 'Số tiền đã thanh toán',
      paymentMethod: 'Phương thức thanh toán',
      paymentDate: 'Ngày thanh toán',
      paymentNote: 'Ghi chú thanh toán'
    };
    return labels[fieldName] || fieldName;
  }

  private validateForApproval(): boolean {
    const requiredFields = ['projectId', 'subscriptionCode', 'numMonths', 'amount', 'amountPaid', 'paymentMethod', 'paymentDate'];
    let isValid = true;

    requiredFields.forEach(field => {
      const control = this.subscriptionForm.get(field);
      if (control && !control.value) {
        control.markAsTouched();
        control.setErrors({ required: true });
        isValid = false;
      }
    });

    return isValid;
  }

  onSaveDraft(): void {
    // Validate basic fields only
    const basicFields = ['projectId', 'subscriptionCode', 'numMonths', 'amount'];
    let isValid = true;

    basicFields.forEach(field => {
      const control = this.subscriptionForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        isValid = false;
      }
    });

    if (!isValid) {
      this.showError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    this.submitForm(false); // isApproved = false
  }

  onSaveAndApprove(): void {
    if (!this.validateForApproval()) {
      this.showError('Vui lòng điền đầy đủ các thông tin bắt buộc để duyệt gói dịch vụ');
      return;
    }

    this.submitForm(true); // isApproved = true
  }

  private submitForm(isApproved: boolean): void {
    this.isSubmitting = true;

    const formValue = this.subscriptionForm.getRawValue(); // Get all values including disabled
    const dto: SubscriptionCreateOrUpdateDto = {
      projectId: formValue.projectId,
      subscriptionCode: formValue.subscriptionCode,
      numMonths: formValue.numMonths,
      amount: formValue.amount,
      amountPaid: formValue.amountPaid || undefined,
      paymentMethod: formValue.paymentMethod || undefined,
      paymentDate: formValue.paymentDate || undefined,
      paymentNote: formValue.paymentNote || undefined,
      isApproved: isApproved
    };

    const request$ = this.mode === 'edit' && this.subscription
      ? this.subscriptionService.updateSubscription(this.subscription.subscriptionId, dto)
      : this.subscriptionService.createSubscription(dto);

    request$.subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.succeeded) {
          const message = isApproved 
            ? 'Duyệt gói dịch vụ thành công.' 
            : 'Lưu nháp thành công.';
          this.showSuccess(message);
          this.dialogRef.close(true); // Return true to refresh the list
        } else {
          this.showError(response.message || 'Có lỗi xảy ra');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || error.message || 'Có lỗi xảy ra';
        this.showError(errorMessage);
        console.error('Error submitting form:', error);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}

