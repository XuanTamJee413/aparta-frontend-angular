import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
      readingWindowEnd: [{value: 3, disabled: true}, [Validators.required]]
    });
    
    // Tự động tính readingWindowEnd = readingWindowStart + 2 (bắt buộc)
    this.editForm.get('readingWindowStart')?.valueChanges.subscribe(startValue => {
      if (startValue != null && startValue >= 1 && startValue <= 31) {
        const endControl = this.editForm.get('readingWindowEnd');
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
          // Patch value với dữ liệu từ server
          const buildingData = {
            ...this.currentBuilding,
            readingWindowEnd: this.currentBuilding.readingWindowStart + 2 > 31 
              ? 1 
              : this.currentBuilding.readingWindowStart + 2
          };
          this.editForm.patchValue(buildingData);
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
      readingWindowEnd: formValue.readingWindowStart + 2 > 31 ? 1 : formValue.readingWindowStart + 2
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

  // Getter để hiển thị ngày tạo invoice động
  get invoiceGenerationDay(): string {
    const startDay = this.editForm.get('readingWindowStart')?.value;
    if (!startDay) return '0';
    
    let endDay = startDay + 2;
    if (endDay > 31) {
      endDay = 1; // Sang tháng sau
    }
    
    const invoiceDay = endDay + 1;
    // Nếu invoiceDay > 31, cũng là tháng sau
    if (invoiceDay > 31) {
      return `${invoiceDay - 31} (tháng sau)`;
    }
    // Nếu endDay < startDay (sang tháng sau), invoice cũng sang tháng sau
    if (endDay < startDay) {
      return `${invoiceDay} (tháng sau)`;
    }
    return invoiceDay.toString();
  }

  // Getter để hiển thị ngày kết thúc chốt số
  get calculatedEndDay(): number {
    const startDay = this.editForm.get('readingWindowStart')?.value;
    if (!startDay) return 0;
    const endDay = startDay + 2;
    return endDay > 31 ? 1 : endDay;
  }

  // Helper để kiểm tra ngày có hợp lệ với tháng hiện tại không
  getDaysInCurrentMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  // Getter để kiểm tra cảnh báo ngày không tồn tại trong tháng
  get hasInvalidDayWarning(): { start: boolean, end: boolean } {
    const daysInMonth = this.getDaysInCurrentMonth();
    const startDay = this.editForm.get('readingWindowStart')?.value;
    const endDay = this.editForm.get('readingWindowEnd')?.value;
    
    return {
      start: startDay != null && startDay > daysInMonth,
      end: endDay != null && endDay > daysInMonth && endDay >= this.editForm.get('readingWindowStart')?.value
    };
  }

}