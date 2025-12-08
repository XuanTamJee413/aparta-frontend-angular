import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BuildingService, BuildingDetailResponse } from '../../../../services/admin/building.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-building-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './building-create.component.html',
  styleUrls: ['./building-create.component.css']
})
export class BuildingCreateComponent implements OnInit, OnDestroy {
  createForm: FormGroup;
  projects: ProjectDto[] = [];
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm = this.fb.group({
      projectId: ['', Validators.required],
      // Building Code: Bắt buộc, Pattern chữ hoa/số/_
      buildingCode: ['', [Validators.required, Validators.pattern('^[A-Z0-9_]+$')]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      totalFloors: [1, [Validators.required, Validators.min(1), Validators.max(200)]],
      totalBasements: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      totalArea: [null, [Validators.min(0.01)]], // Diện tích phải dương
      handoverDate: [null, [this.dateRangeValidator.bind(this)]],
      description: [''],
      // Hotline: Chỉ số, độ dài 8-15
      receptionPhone: ['', [Validators.pattern('^[0-9]*$'), Validators.minLength(8), Validators.maxLength(15)]],
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

    // [TỰ ĐỘNG SINH MÃ] Lắng nghe thay đổi tên để sinh mã gợi ý
    this.createForm.get('name')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.generateBuildingCode(value);
      });

    // Lắng nghe thay đổi projectId để cập nhật mã tòa nhà với đuôi dự án
    this.createForm.get('projectId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentName = this.createForm.get('name')?.value;
        if (currentName) {
          this.generateBuildingCode(currentName);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Hàm sinh mã tòa nhà từ tên (VD: "Tòa Park 1" + Project "Hồ Tân Xã" -> "TOA_PARK_1_DAHTX")
  private generateBuildingCode(name: string): void {
    if (!name) return;

    // 1. Chuyển sang không dấu
    let code = this.toLatin(name);
    // 2. Thay khoảng trắng bằng gạch dưới
    code = code.trim().replace(/\s+/g, '_');
    // 3. Chuyển thành chữ hoa
    code = code.toUpperCase();
    // 4. Loại bỏ ký tự đặc biệt (chỉ giữ A-Z, 0-9, _)
    code = code.replace(/[^A-Z0-9_]/g, '');

    // 5. Thêm đuôi là viết tắt của tên dự án (nếu có)
    const projectId = this.createForm.get('projectId')?.value;
    if (projectId) {
      const selectedProject = this.projects.find(p => p.projectId === projectId);
      if (selectedProject && selectedProject.name) {
        const projectAcronym = this.getAcronym(selectedProject.name);
        code = `${code}_DA${projectAcronym}`;
      }
    }

    // Set value nhưng không emit event để tránh loop (nếu cần)
    this.createForm.get('buildingCode')?.setValue(code, { emitEvent: false });
  }

  private toLatin(str: string): string {
    if (!str) return '';
    let result = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return result;
  }

  // Hàm lấy viết tắt từ tên (giống project-create)
  private getAcronym(str: string): string {
    const latinStr = this.toLatin(str);
    // Loại bỏ ký tỹ đặc biệt, chỉ giữ chữ, số và khoảng trắng
    const cleaned = latinStr.replace(/[^a-zA-Z0-9\s]/g, '');
    return cleaned
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  // Validator cho ngày bàn giao: phải từ năm 1990 và không quá 50 năm trong tương lai
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // Cho phép để trống

    const selectedDate = new Date(control.value);
    const currentYear = new Date().getFullYear();
    const selectedYear = selectedDate.getFullYear();

    if (selectedYear < 1990) {
      return { tooOld: true };
    }
    if (selectedYear > currentYear + 50) {
      return { tooFuture: true };
    }
    return null;
  }

  onSubmit() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    // Validate logic ngày chốt số
    const start = this.createForm.get('readingWindowStart')?.value;
    const end = this.createForm.get('readingWindowEnd')?.value;
    if (start >= end) {
      this.snackBar.open('Ngày bắt đầu chốt số phải nhỏ hơn ngày kết thúc.', 'Đóng', {
        duration: 4000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top'
      });
      return;
    }

    this.isSubmitting = true;
    
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
          this.snackBar.open('Tạo tòa nhà thành công!', 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            verticalPosition: 'top'
          });
          setTimeout(() => this.router.navigate(['/admin/building/list']), 1500);
        } else {
          this.snackBar.open(res.message || 'Lỗi khi tạo tòa nhà.', 'Đóng', {
            duration: 4000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top'
          });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.snackBar.open(err.error?.message || 'Đã xảy ra lỗi hệ thống.', 'Đóng', {
          duration: 4000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top'
        });
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