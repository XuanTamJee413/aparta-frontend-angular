import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProjectService, ProjectDto, ProjectUpdateDto } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-project-edit',
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
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css']
})
export class ProjectEditComponent implements OnInit {
  projectForm: FormGroup;
  isLoading = false;
  loadingProject = false;
  projectId: string = '';
  currentProject: ProjectDto | null = null;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.projectForm = this.fb.group({
      projectCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadProject();
    } else {
      this.snackBar.open('Không tìm thấy ID dự án', 'Đóng', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/admin/project/list']);
    }
  }

  private loadProject(): void {
    this.loadingProject = true;
    
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (response: any) => {
        if (response.succeeded && response.data) {
          this.currentProject = response.data;
          this.populateForm(response.data);
        } else {
          this.snackBar.open(response.message || 'Không tìm thấy dự án', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/admin/project/list']);
        }
        this.loadingProject = false;
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.snackBar.open('Lỗi khi tải thông tin dự án', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/admin/project/list']);
        this.loadingProject = false;
      }
    });
  }

  private populateForm(project: ProjectDto): void {
    this.projectForm.patchValue({
      projectCode: project.projectCode || '',
      name: project.name || '',
      numApartments: project.numApartments || 0,
      numBuildings: project.numBuildings || 0,
      isActive: project.isActive
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.isLoading = true;
      
      const updateData: ProjectUpdateDto = {
        projectCode: this.projectForm.value.projectCode,
        name: this.projectForm.value.name,
        numApartments: this.projectForm.value.numApartments || 0,
        numBuildings: this.projectForm.value.numBuildings || 0,
        isActive: this.projectForm.value.isActive
      };

      this.projectService.updateProject(this.projectId, updateData).subscribe({
        next: (response: any) => {
          if (response.succeeded) {
            // Hiển thị message từ backend hoặc message mặc định
            const successMessage = response.message || 'Cập nhật dự án thành công!';
            this.snackBar.open(successMessage, 'Đóng', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/admin/project/list']);
          } else {
            // Hiển thị message từ backend hoặc message mặc định
            const errorMessage = response.message || 'Lỗi khi cập nhật dự án';
            this.snackBar.open(errorMessage, 'Đóng', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error updating project:', error);
          
          // Xử lý error response từ backend
          let errorMessage = 'Lỗi khi cập nhật dự án';
          
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

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  }
}
