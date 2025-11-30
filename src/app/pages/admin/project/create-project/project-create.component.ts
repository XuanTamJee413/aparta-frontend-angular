import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService, ProjectDetailResponse } from '../../../../services/admin/project.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class ProjectCreateComponent implements OnInit, OnDestroy {
  createForm: FormGroup;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm = this.fb.group({
      // 1. Thông tin chung
      name: ['', [Validators.required, Validators.minLength(3)]],
      projectCode: ['', [Validators.required, Validators.pattern('^[A-Z0-9_]+$')]],
      
      // 2. Địa chỉ
      address: [''],
      ward: [''],
      district: [''],
      city: [''],
      
      // 3. Ngân hàng
      bankName: [''],
      bankAccountNumber: ['', [Validators.pattern('^[0-9]+$')]],
      bankAccountName: ['']
    });
  }

  ngOnInit(): void {
    // Lắng nghe sự thay đổi của Tên dự án để sinh Mã dự án
    this.createForm.get('name')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.generateProjectCode(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateProjectCode(name: string): void {
    if (!name) {
      return;
    }

    const currentYear = new Date().getFullYear();
    const acronym = this.getAcronym(name);
    const autoCode = `${acronym}${currentYear}`;

    // Gán giá trị vào ô ProjectCode
    this.createForm.get('projectCode')?.setValue(autoCode);
  }

  // 1. Hàm chuyển đổi sang Latin không dấu
  private toLatin(str: string): string {
    if (!str) return '';
    
    // Thay thế thủ công Đ/đ trước khi chuẩn hóa NFD
    let result = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    
    // Chuẩn hóa NFD và loại bỏ dấu
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Loại bỏ các ký tự đặc biệt (giữ lại chữ, số và khoảng trắng)
    result = result.replace(/[^a-zA-Z0-9\s]/g, '');
    
    return result;
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

  onSubmit() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.projectService.createProject(this.createForm.value).subscribe({
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
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['mat-toolbar', 'mat-primary'] : ['mat-toolbar', 'mat-warn']
    });
  }
}