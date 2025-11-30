import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BuildingService, BuildingDto, BuildingDetailResponse, BuildingBasicResponse } from '../../../../services/admin/building.service';

@Component({
  selector: 'app-building-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './building-edit.component.html',
  styleUrls: ['./building-edit.component.css']
})
export class BuildingEditComponent implements OnInit {
  editForm: FormGroup;
  buildingId: string = '';
  currentBuilding: BuildingDto | null = null;
  
  // Fix: Dùng tên biến chuẩn để tránh lỗi TS2339
  isLoading = false; 
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      // Chỉ hiển thị
      projectId: [{value: '', disabled: true}],
      buildingCode: [{value: '', disabled: true}],
      
      // Cho phép sửa
      name: ['', Validators.required],
      isActive: [true],
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
    this.buildingId = this.route.snapshot.paramMap.get('id') || '';
    if (this.buildingId) {
      this.loadBuilding();
    }
  }

  loadBuilding() {
    this.isLoading = true;
    this.buildingService.getBuildingById(this.buildingId).subscribe({
      next: (res: BuildingDetailResponse) => {
        if (res.succeeded && res.data) {
          this.currentBuilding = res.data;
          this.editForm.patchValue(this.currentBuilding);
        } else {
          this.errorMessage = 'Không tìm thấy tòa nhà.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Lỗi khi tải dữ liệu.';
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
      totalFloors: formValue.totalFloors,
      totalBasements: formValue.totalBasements,
      totalArea: formValue.totalArea,
      handoverDate: formValue.handoverDate,
      description: formValue.description,
      receptionPhone: formValue.receptionPhone,
      readingWindowStart: formValue.readingWindowStart,
      readingWindowEnd: formValue.readingWindowEnd
    };

    this.buildingService.updateBuilding(this.buildingId, updateDto).subscribe({
      next: (res: BuildingBasicResponse) => {
        this.isSubmitting = false;
        if (res.succeeded) {
          this.successMessage = 'Cập nhật thành công!';
          setTimeout(() => this.router.navigate(['/admin/building/list']), 1500);
        } else {
          this.errorMessage = res.message || 'Lỗi cập nhật.';
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Lỗi hệ thống.';
      }
    });
  }
  
  // Helper để tránh lỗi 'isFieldInvalid does not exist' trong HTML
  isFieldInvalid(field: string) {
    const control = this.editForm.get(field);
    return control?.invalid && control?.touched;
  }
}