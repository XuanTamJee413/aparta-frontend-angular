import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
import { BuildingService, BuildingCreateDto } from '../../../../services/admin/building.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-building-create',
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
  templateUrl: './building-create.component.html',
  styleUrls: ['./building-create.component.css']
})
export class BuildingCreateComponent implements OnInit, AfterViewInit, OnDestroy {
  buildingForm: FormGroup;
  isSubmitting = false;
  projects: ProjectDto[] = [];
  private select2Instance: any;

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.buildingForm = this.fb.group({
      projectId: ['', [Validators.required]],
      buildingCode: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  ngAfterViewInit(): void {
    this.initializeSelect2();
  }

  ngOnDestroy(): void {
    if (this.select2Instance && typeof this.select2Instance.destroy === 'function') {
      try {
        this.select2Instance.destroy();
      } catch (error) {
        console.warn('Error destroying Select2 instance:', error);
      }
    }
  }

  private loadProjects(): void {
    this.projectService.getAllProjects({ isActive: true }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.projects = response.data;
          this.populateSelect2();
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.snackBar.open('Không thể tải danh sách dự án', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  private populateSelect2(): void {
    const selectElement = document.getElementById('projectSelect') as HTMLSelectElement;
    if (selectElement) {
      // Clear existing options except the first one
      while (selectElement.children.length > 1) {
        selectElement.removeChild(selectElement.lastChild!);
      }

      // Add project options
      this.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.projectId;
        option.textContent = `${project.projectCode || ''} - ${project.name || ''}`;
        selectElement.appendChild(option);
      });
    }
  }

  private initializeSelect2(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      const selectElement = document.getElementById('projectSelect');
      if (selectElement && typeof (window as any).$ !== 'undefined') {
        try {
          // Destroy existing instance if any
          if (this.select2Instance && typeof this.select2Instance.destroy === 'function') {
            this.select2Instance.destroy();
          }

          this.select2Instance = (window as any).$('.js-example-templating').select2({
            templateResult: this.formatState.bind(this),
            placeholder: 'Chọn dự án...',
            allowClear: true,
            width: '100%'
          });

          // Handle selection change
          this.select2Instance.on('select2:select', (e: any) => {
            const selectedValue = e.params.data.id;
            this.buildingForm.patchValue({ projectId: selectedValue });
          });

          this.select2Instance.on('select2:clear', () => {
            this.buildingForm.patchValue({ projectId: '' });
          });
        } catch (error) {
          console.error('Error initializing Select2:', error);
        }
      }
    }, 100);
  }

  private formatState(state: any): any {
    if (!state.id) {
      return state.text;
    }
    
    const project = this.projects.find(p => p.projectId === state.id);
    if (project) {
      const $state = (window as any).$(
        '<span>' + (project.projectCode || '') + ' - ' + (project.name || '') + '</span>'
      );
      return $state;
    }
    
    return state.text;
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
      projectId: 'Mã dự án',
      buildingCode: 'Mã tòa nhà',
      name: 'Tên tòa nhà'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    if (this.buildingForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const buildingData: BuildingCreateDto = this.buildingForm.value;

    this.buildingService.createBuilding(buildingData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.succeeded) {
          this.snackBar.open(response.message || 'Tạo tòa nhà thành công!', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.router.navigate(['/admin/building/list']);
        } else {
          this.snackBar.open(response.message || 'Tạo tòa nhà thất bại', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || error.message || 'Có lỗi xảy ra khi tạo tòa nhà';
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.error('Error creating building:', error);
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
