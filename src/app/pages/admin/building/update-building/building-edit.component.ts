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
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { BuildingService, BuildingDto, BuildingUpdateDto } from '../../../../services/admin/building.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-building-edit',
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
    MatSelectModule
  ],
  templateUrl: './building-edit.component.html',
  styleUrls: ['./building-edit.component.css']
})
export class BuildingEditComponent implements OnInit {
  currentBuilding: BuildingDto | null = null;
  projects: ProjectDto[] = [];
  buildingForm: FormGroup;
  loadingProject = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.buildingForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadBuilding();
  }

  loadProjects(): void {
    this.projectService.getAllProjects({ isActive: true }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.projects = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.buildingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.buildingForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} là bắt buộc`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} không được vượt quá ${maxLength} ký tự`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} phải lớn hơn hoặc bằng 0`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Tên tòa nhà',
      numApartments: 'Số căn hộ',
      numResidents: 'Số cư dân'
    };
    return labels[fieldName] || fieldName;
  }

  getProjectCode(projectId: string): string {
    const project = this.projects.find(p => p.projectId === projectId);
    return project ? project.projectCode || projectId : projectId;
  }

  loadBuilding(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.snackBar.open('Mã tòa nhà không hợp lệ', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      this.router.navigate(['/admin/building/list']);
      return;
    }

    this.loadingProject = true;

    this.buildingService.getBuildingById(id).subscribe({
      next: (response) => {
        this.loadingProject = false;
        if (response.succeeded && response.data) {
          this.currentBuilding = response.data;
          this.buildingForm.patchValue({
            name: this.currentBuilding.name || '',
            numApartments: this.currentBuilding.numApartments,
            numResidents: this.currentBuilding.numResidents,
            isActive: this.currentBuilding.isActive
          });
        } else {
          this.snackBar.open(response.message || 'Không tìm thấy tòa nhà', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.router.navigate(['/admin/building/list']);
        }
      },
      error: (error) => {
        this.loadingProject = false;
        this.snackBar.open('Có lỗi xảy ra khi tải thông tin tòa nhà', 'Đóng', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.error('Error loading building:', error);
        this.router.navigate(['/admin/building/list']);
      }
    });
  }

  onSubmit(): void {
    if (this.buildingForm.invalid || this.isSubmitting || !this.currentBuilding) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const updateData: BuildingUpdateDto = this.buildingForm.value;

    this.buildingService.updateBuilding(this.currentBuilding.buildingId, updateData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.succeeded) {
          this.snackBar.open(response.message || 'Cập nhật tòa nhà thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadBuilding(); // Reload to get updated data
        } else {
          this.snackBar.open(response.message || 'Cập nhật tòa nhà thất bại', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || error.message || 'Có lỗi xảy ra khi cập nhật tòa nhà';
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.error('Error updating building:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/building/list']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.buildingForm.controls).forEach(key => {
      const control = this.buildingForm.get(key);
      control?.markAsTouched();
    });
  }
}
