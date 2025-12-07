import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService, ProjectDetailResponse } from '../../../../services/admin/project.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class ProjectCreateComponent implements OnInit, OnDestroy {
  createForm: FormGroup;
  isSubmitting = false;
  isValidatingPayOS = false;
  payOSValidationMessage = '';
  payOSValidationStatus: 'idle' | 'valid' | 'invalid' = 'idle';
  
  // Project Code duplicate check
  isCheckingProjectCode = false;
  projectCodeCheckMessage = '';
  projectCodeExists = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm = this.fb.group({
      // 1. Thông tin chung
      name: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern('^[a-zA-ZÀ-ỹĐđ0-9\\s!_-]+$') // Chỉ cho phép chữ cái, số, khoảng trắng, !, _, -
      ]],
      projectCode: ['', [Validators.required, Validators.pattern('^[A-Z0-9_]+$')]],
      
      // 2. Địa chỉ
      address: [''],
      ward: [''],
      district: [''],
      city: [''],
      
      // 3. Ngân hàng
      bankName: ['PayOS'],
      bankAccountNumber: ['', [Validators.pattern('^[0-9]+$')]],
      bankAccountName: [''],
      
      // 4. PayOS Settings (Tùy chọn)
      payOSClientId: [''],
      payOSApiKey: [''],
      payOSChecksumKey: ['']
    });
  }

  ngOnInit(): void {
    // Set bankName mặc định là "PayOS"
    // Lắng nghe sự thay đổi của Tên dự án để sinh Mã dự án
    this.createForm.get('name')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.generateProjectCode(value);
      });

    // Lắng nghe sự thay đổi của Mã dự án để check trùng
    this.createForm.get('projectCode')?.valueChanges
      .pipe(
        debounceTime(500), // Chờ 500ms sau khi người dùng ngừng gõ
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(code => {
        this.checkProjectCodeExists(code);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateProjectCode(name: string): void {
    if (!name || name.trim() === '') {
      // Nếu tên dự án trống, xóa luôn mã dự án
      this.createForm.get('projectCode')?.setValue('');
      return;
    }

    const currentYear = new Date().getFullYear();
    const acronym = this.getAcronym(name);
    const autoCode = `${acronym}${currentYear}`;

    // Gán giá trị vào ô ProjectCode
    this.createForm.get('projectCode')?.setValue(autoCode);
  }

  // Xóa tên dự án
  clearProjectName() {
    this.createForm.get('name')?.setValue('');
  }

  // 1. Hàm chuyển đổi sang Latin không dấu
  private toLatin(str: string): string {
    if (!str) return '';
    
    // Thay thế thủ công Đ/đ trước khi chuẩn hóa NFD
    const strNoDSign = str.replace(/Đ/g, 'D').replace(/đ/g, 'd');
    
    return strNoDSign
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '');
  }

  // Kiểm tra mã dự án có bị trùng không
  private checkProjectCodeExists(code: string): void {
    // Reset trạng thái
    this.projectCodeExists = false;
    this.projectCodeCheckMessage = '';

    // Nếu mã trống hoặc không hợp lệ, không kiểm tra
    if (!code || code.trim().length < 2) {
      return;
    }

    // Kiểm tra pattern trước
    const pattern = /^[A-Z0-9_]+$/;
    if (!pattern.test(code)) {
      return; // Để validator pattern xử lý
    }

    this.isCheckingProjectCode = true;
    this.projectCodeCheckMessage = 'Đang kiểm tra...';

    // Gọi API lấy danh sách dự án để kiểm tra trùng mã
    this.projectService.getProjects({ searchTerm: code }).subscribe({
      next: (res: any) => {
        this.isCheckingProjectCode = false;
        if (res.succeeded && res.data) {
          // Kiểm tra xem có dự án nào có mã trùng không (so sánh chính xác, không phân biệt hoa thường)
          const existingProject = res.data.find((p: any) => 
            p.projectCode.toUpperCase() === code.toUpperCase()
          );
          
          if (existingProject) {
            this.projectCodeExists = true;
            this.projectCodeCheckMessage = `⚠️ Mã "${code}" đã tồn tại (Dự án: ${existingProject.name})`;
          } else {
            this.projectCodeExists = false;
            this.projectCodeCheckMessage = '✓ Mã dự án hợp lệ';
          }
        } else {
          this.projectCodeCheckMessage = '';
        }
      },
      error: () => {
        this.isCheckingProjectCode = false;
        this.projectCodeCheckMessage = '';
      }
    });
  }

  // 2. Hàm lấy chữ cái đầu từ chuỗi đã chuyển Latin
  private getAcronym(str: string): string {
    const latinStr = this.toLatin(str);
    
    return latinStr
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  // Reset PayOS validation khi user thay đổi input
  resetPayOSValidation() {
    // Chỉ reset nếu đã có validation status (đã click nút kiểm tra)
    if (this.payOSValidationStatus !== 'idle') {
      this.payOSValidationStatus = 'idle';
      this.payOSValidationMessage = '';
      // Enable lại 2 trường bank account khi reset
      this.createForm.get('bankAccountNumber')?.enable();
      this.createForm.get('bankAccountName')?.enable();
      // Clear giá trị
      this.createForm.patchValue({
        bankAccountNumber: '',
        bankAccountName: ''
      });
    }
  }

  validatePayOS() {
    const clientId = this.createForm.get('payOSClientId')?.value;
    const apiKey = this.createForm.get('payOSApiKey')?.value;
    const checksumKey = this.createForm.get('payOSChecksumKey')?.value;

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
            this.createForm.patchValue({
              bankAccountNumber: res.data.accountNumber
            });
            // Disable trường số tài khoản sau khi điền
            this.createForm.get('bankAccountNumber')?.disable();
          }
          if (res.data?.accountName) {
            this.createForm.patchValue({
              bankAccountName: res.data.accountName
            });
            // Disable trường tên chủ tài khoản sau khi điền
            this.createForm.get('bankAccountName')?.disable();
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
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    // Kiểm tra mã dự án có bị trùng không
    if (this.projectCodeExists) {
      this.showNotification('Mã dự án đã tồn tại. Vui lòng chọn mã khác.', 'error');
      return;
    }

    // Kiểm tra PayOS validation nếu có nhập PayOS settings
    const hasPayOS = this.createForm.get('payOSClientId')?.value || 
                     this.createForm.get('payOSApiKey')?.value || 
                     this.createForm.get('payOSChecksumKey')?.value;

    if (hasPayOS && this.payOSValidationStatus !== 'valid') {
      this.showNotification('Vui lòng kiểm tra và xác thực tài khoản PayOS trước khi tạo dự án', 'error');
      return;
    }

    // Enable các trường disabled để gửi giá trị khi submit
    const formValue = { ...this.createForm.value };
    if (this.createForm.get('bankName')?.disabled) {
      formValue.bankName = 'PayOS';
    }
    if (this.createForm.get('bankAccountNumber')?.disabled) {
      formValue.bankAccountNumber = this.createForm.get('bankAccountNumber')?.value;
    }
    if (this.createForm.get('bankAccountName')?.disabled) {
      formValue.bankAccountName = this.createForm.get('bankAccountName')?.value;
    }

    this.isSubmitting = true;

    this.projectService.createProject(formValue).subscribe({
      next: (res: ProjectDetailResponse) => {
        this.isSubmitting = false;
        if (res.succeeded) {
          this.showNotification('Tạo dự án thành công!', 'success');
          setTimeout(() => {
            this.router.navigate(['/admin/project/list']);
          }, 1500);
        } else {
          this.showNotification(res.message || 'Lỗi khi tạo dự án.', 'error');
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Đã xảy ra lỗi hệ thống.';
        this.showNotification(msg, 'error');
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Đóng', {
      duration: type === 'success' ? 3000 : 4000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      verticalPosition: 'top'
    });
  }
}