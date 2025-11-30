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
      bankAccountName: ['']
    });
  }

  ngOnInit(): void {
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

  onSubmit() {
    if (this.editForm.invalid) return;

    this.isSubmitting = true;

    const formValue = this.editForm.getRawValue();
    const updateDto = {
      name: formValue.name,
      isActive: formValue.isActive,
      address: formValue.address,
      ward: formValue.ward,
      district: formValue.district,
      city: formValue.city,
      bankName: formValue.bankName,
      bankAccountNumber: formValue.bankAccountNumber,
      bankAccountName: formValue.bankAccountName
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