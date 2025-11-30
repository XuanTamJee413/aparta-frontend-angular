import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
      readingWindowEnd: [{value: 3, disabled: true}, [Validators.required]]
    });
    
    // Tự động tính readingWindowEnd = readingWindowStart + 2 (bắt buộc)
    this.createForm.get('readingWindowStart')?.valueChanges.subscribe(startValue => {
      if (startValue != null && startValue >= 1 && startValue <= 31) {
        const endControl = this.createForm.get('readingWindowEnd');
        let endValue = startValue + 2;
        // Nếu vượt quá 31, cho phép sang tháng sau (set = 1)
        if (endValue > 31) {
          endValue = 1; // Sang tháng sau
        }
        endControl?.setValue(endValue, { emitEvent: false });
      }
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
    
    const formValue = this.createForm.getRawValue();
    const buildingData = {
      ...formValue,
      readingWindowEnd: formValue.readingWindowStart + 2 > 31 
        ? 1 
        : formValue.readingWindowStart + 2
    };
    
    this.buildingService.createBuilding(buildingData).subscribe({
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

  // Getter để hiển thị ngày tạo invoice động
  get invoiceGenerationDay(): string {
    const endDay = this.createForm.get('readingWindowEnd')?.value;
    const startDay = this.createForm.get('readingWindowStart')?.value;
    
    if (!endDay || !startDay) return '0';
    
    // Nếu end < start, nghĩa là sang tháng sau
    if (endDay < startDay) {
      return `${endDay + 1} (tháng sau)`;
    } else {
      const invoiceDay = endDay + 1;
      // Nếu vượt quá 31, cũng là tháng sau
      if (invoiceDay > 31) {
        return `${invoiceDay - 31} (tháng sau)`;
      }
      return invoiceDay.toString();
    }
  }

  // Getter để hiển thị ngày kết thúc chốt số
  get calculatedEndDay(): number {
    const endDay = this.createForm.get('readingWindowEnd')?.value;
    return endDay || 0;
  }

  // Helper để kiểm tra ngày có hợp lệ với tháng hiện tại không
  getDaysInCurrentMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  // Getter để kiểm tra cảnh báo ngày không tồn tại trong tháng
  get hasInvalidDayWarning(): { start: boolean, end: boolean } {
    const daysInMonth = this.getDaysInCurrentMonth();
    const startDay = this.createForm.get('readingWindowStart')?.value;
    const endDay = this.createForm.get('readingWindowEnd')?.value;
    
    return {
      start: startDay != null && startDay > daysInMonth,
      end: endDay != null && endDay > daysInMonth && endDay >= this.createForm.get('readingWindowStart')?.value
    };
  }

  // Custom validator để đảm bảo logic hợp lệ
  private readingWindowValidator(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const start = formGroup.get('readingWindowStart')?.value;
    const end = formGroup.get('readingWindowEnd')?.value;
    
    if (start == null || end == null) {
      return null; // Để các validator khác xử lý required
    }
    
    // Cho phép end < start (sang tháng sau) hoặc end > start (cùng tháng)
    // Chỉ không cho phép end == start
    if (start === end) {
      formGroup.get('readingWindowEnd')?.setErrors({ sameAsStart: true });
      return { sameAsStart: true };
    }
    
    return null;
  }
}