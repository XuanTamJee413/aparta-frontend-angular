import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BuildingService, BuildingDetailResponse } from '../../../../services/admin/building.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-building-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './building-create.component.html',
  styleUrls: ['./building-create.component.css']
})
export class BuildingCreateComponent implements OnInit {
  createForm: FormGroup;
  projects: ProjectDto[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      projectId: ['', Validators.required],
      buildingCode: ['', [Validators.required, Validators.pattern('^[A-Z0-9_]+$')]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      totalFloors: [1, [Validators.required, Validators.min(1)]],
      totalBasements: [0, [Validators.required, Validators.min(0)]],
      totalArea: [null],
      handoverDate: [null],
      description: [''],
      receptionPhone: [''],
      readingWindowStart: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      readingWindowEnd: [5, [Validators.required, Validators.min(1), Validators.max(31)]]
    });
  }

  ngOnInit(): void {
    this.projectService.getAllProjects({ isActive: true }).subscribe({
      next: (res: any) => {
        if (res.succeeded && res.data) {
          this.projects = res.data;
        }
      }
    });
  }

  onSubmit() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    this.buildingService.createBuilding(this.createForm.value).subscribe({
      next: (res: BuildingDetailResponse) => {
        this.isSubmitting = false;
        if (res.succeeded) {
          this.successMessage = 'Tạo tòa nhà thành công!';
          setTimeout(() => this.router.navigate(['/admin/building/list']), 1500);
        } else {
          this.errorMessage = res.message || 'Lỗi khi tạo tòa nhà.';
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Đã xảy ra lỗi hệ thống.';
      }
    });
  }
}