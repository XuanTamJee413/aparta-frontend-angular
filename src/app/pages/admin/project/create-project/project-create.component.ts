import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ProjectService, ProjectCreateDto } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class ProjectCreateComponent implements OnInit {
  projectForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.projectForm = this.fb.group({
      projectCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    // No need to generate project ID - backend will handle it
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.isLoading = true;
      
      const projectData: ProjectCreateDto = {
        projectCode: this.projectForm.value.projectCode,
        name: this.projectForm.value.name
      };

      this.projectService.createProject(projectData).subscribe({
        next: (response: any) => {
          console.log('Create project response:', response); // Debug log
          if (response.succeeded) {
            // Hiển thị message từ backend hoặc message mặc định
            const successMessage = response.message || 'Tạo dự án thành công!';
            this.snackBar.open(successMessage, 'Đóng', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/admin/project/list']);
          } else {
            // Hiển thị message từ backend hoặc message mặc định
            const errorMessage = response.message || 'Lỗi khi tạo dự án';
            this.snackBar.open(errorMessage, 'Đóng', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error creating project:', error);
          
          // Xử lý error response từ backend
          let errorMessage = 'Lỗi khi tạo dự án';
          
          if (error.error && error.error.message) {
            // Nếu backend trả về error với message
            errorMessage = error.error.message;
          } else if (error.message) {
            // Nếu có message trong error object
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Vui lòng kiểm tra lại thông tin nhập vào', 'Đóng', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/project/list']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.projectForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control?.hasError('minlength')) {
      return `Tối thiểu ${control.errors?.['minlength'].requiredLength} ký tự`;
    }
    if (control?.hasError('maxlength')) {
      return `Tối đa ${control.errors?.['maxlength'].requiredLength} ký tự`;
    }
    if (control?.hasError('min')) {
      return `Giá trị tối thiểu là ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `Giá trị tối đa là ${control.errors?.['max'].max}`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.projectForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
