import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VisitorCreateDto, VisitorService, VisitLogStaffViewDto, VisitorQueryParams, VisitLogUpdateDto } from '../../../services/resident/visitor.service';
import { AuthService } from '../../../services/auth.service';
import { RecentVisitorDialogComponent } from './recent-visitor/recent-visitor';

@Injectable()
export class AppDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${this._to2digit(day)}/${this._to2digit(month)}/${year}`;
    } else {
      return date.toDateString();
    }
  }
  private _to2digit(n: number): string {
    return ('00' + n).slice(-2);
  }
}
export const APP_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class VisitorComponent implements OnInit {

  visitorForm!: FormGroup;
  timeSlots: string[] = [];
  minDate: Date;
  editingLogId: string | null = null;

  private residentApartmentId: string = '';

  isLoadingHistory = false;
  displayedColumns: string[] = ['visitorFullName', 'purpose', 'checkinTime', 'status', 'actions'];
  history: any[] = [];

  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private dialog: MatDialog
  ) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    const userPayload = this.auth.user();
    if (userPayload && userPayload.apartment_id) {
      this.residentApartmentId = String(userPayload.apartment_id);
    } else {
      console.error('Không tìm thấy apartment_id của cư dân.');
      this.snackBar.open('Lỗi: Không thể xác định căn hộ của bạn.', 'Đóng', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.populateTimeSlots();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.visitorForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [
        Validators.maxLength(15),
        Validators.pattern('^[0-9]*$')
      ]],
      idNumber: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern('^[0-9]+$')
      ]],
      purpose: [''],
      checkinDate: [tomorrow, [Validators.required, this.pastDateValidator]],
      checkinTime: ['12:00', Validators.required]
    });

    this.loadHistory();
  }
  openRecentVisitors(): void {
    const dialogRef = this.dialog.open(RecentVisitorDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Auto-fill form khi chọn
        this.visitorForm.patchValue({
          fullName: result.fullName,
          phone: result.phone,
          idNumber: result.idNumber
        });
        this.snackBar.open('Đã điền thông tin khách.', 'Đóng', { duration: 2000 });
      }
    });
  }
  pastDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { 'pastDate': true };
    }

    return null;
  }


  onSubmit(): void {
    if (this.visitorForm.invalid) {
      this.visitorForm.markAllAsTouched();
      return;
    }

    const date: Date = this.visitorForm.value.checkinDate;
    const time: string = this.visitorForm.value.checkinTime;
    const [hours, minutes] = time.split(':').map(Number);
    const combinedCheckinTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);

    if (combinedCheckinTime <= new Date()) {
      this.snackBar.open('Lỗi: Thời gian phải ở trong tương lai.', 'Đóng', {
        duration: 5000, panelClass: ['error-snackbar']
      });
      return;
    }

    const pad = (num: number) => num.toString().padStart(2, '0');
    const localISOString = `${combinedCheckinTime.getFullYear()}-${pad(combinedCheckinTime.getMonth() + 1)}-${pad(combinedCheckinTime.getDate())}T${pad(combinedCheckinTime.getHours())}:${pad(combinedCheckinTime.getMinutes())}:${pad(combinedCheckinTime.getSeconds())}`;

    // --- LOGIC CẬP NHẬT (EDIT) ---
    if (this.editingLogId) {
      const updateDto: VisitLogUpdateDto = {
        fullName: this.visitorForm.value.fullName,
        phone: this.visitorForm.value.phone,
        idNumber: this.visitorForm.value.idNumber,
        purpose: this.visitorForm.value.purpose,
        checkinTime: localISOString
      };

      this.visitorService.updateVisitLog(this.editingLogId, updateDto).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật thành công!', 'Đóng', { duration: 3000, panelClass: ['success-snackbar'] });
          this.cancelEdit(); // Reset form về chế độ thêm mới
          this.loadHistory();
        },
        error: (err) => this.handleError(err, 'Không thể cập nhật')
      });
    }
    // --- LOGIC TẠO MỚI (CREATE) ---
    else {
      const createDto: VisitorCreateDto = {
        fullName: this.visitorForm.value.fullName,
        phone: this.visitorForm.value.phone,
        idNumber: this.visitorForm.value.idNumber,
        purpose: this.visitorForm.value.purpose,
        apartmentId: this.residentApartmentId,
        checkinTime: localISOString,
        status: 'Pending'
      };

      this.visitorService.createVisitor(createDto).subscribe({
        next: (created) => {
          this.snackBar.open(`Đăng ký thành công: ${created.fullName}`, 'Đóng', { duration: 3000, panelClass: ['success-snackbar'] });
          this.resetForm();
          this.loadHistory();
        },
        error: (err) => this.handleError(err, 'Không thể đăng ký')
      });
    }
  }
  editVisit(log: VisitLogStaffViewDto): void {
    this.editingLogId = log.visitLogId;

    // Parse ngày giờ từ chuỗi checkinTime của log
    const checkinDateObj = new Date(log.checkinTime);

    // Tách giờ phút để set cho dropdown
    const hours = checkinDateObj.getHours().toString().padStart(2, '0');
    const minutes = checkinDateObj.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // Đẩy dữ liệu lên form
    this.visitorForm.patchValue({
      fullName: log.visitorFullName,
      phone: log.visitorPhone || '', // Cần backend trả về field này
      idNumber: log.visitorIdNumber,
      purpose: log.purpose,
      checkinDate: checkinDateObj,
      checkinTime: timeString
    });

    // Cuộn trang lên đầu để user thấy form
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.snackBar.open('Đang sửa thông tin. Nhấn "Lưu thay đổi" khi hoàn tất.', 'Đóng', { duration: 3000 });
  }

  // Hủy chế độ sửa -> Quay về thêm mới
  cancelEdit(): void {
    this.editingLogId = null;
    this.resetForm();
  }

  // Hàm xử lý Xóa
  deleteVisit(log: VisitLogStaffViewDto): void {
    if (!confirm(`Bạn có chắc muốn xóa lịch hẹn với ${log.visitorFullName}?`)) return;

    this.visitorService.deleteVisitLog(log.visitLogId).subscribe({
      next: () => {
        this.snackBar.open('Đã xóa thành công.', 'Đóng', { duration: 3000 });
        this.loadHistory();

        // Nếu đang sửa đúng cái log vừa xóa thì reset form
        if (this.editingLogId === log.visitLogId) {
          this.cancelEdit();
        }
      },
      error: (err) => this.handleError(err, 'Xóa thất bại')
    });
  }

  // Helper xử lý lỗi
  private handleError(err: any, defaultMsg: string): void {
    let msg = defaultMsg;
    if (err.error?.message) msg = err.error.message;
    this.snackBar.open(msg, 'Đóng', { duration: 5000, panelClass: ['error-snackbar'] });
    console.error(err);
  }
  resetForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.visitorForm.reset({
      fullName: '',
      phone: '',
      idNumber: '',
      purpose: '',
      checkinDate: tomorrow,
      checkinTime: '12:00'
    });
  }

  loadHistory(): void {
    this.isLoadingHistory = true;

    const params: VisitorQueryParams = {
      apartmentId: this.residentApartmentId,
      pageNumber: 1,
      pageSize: 50,
      sortColumn: 'checkinTime',
      sortDirection: 'desc'
    };

this.visitorService.getResidentVisitHistory(params).subscribe({ 
       next: (pagedData) => {

        this.history = pagedData.items.map(log => {
          let checkinTimeStr = (log as any).checkinTime;

          if (typeof checkinTimeStr === 'string' && !checkinTimeStr.endsWith('Z')) {
            checkinTimeStr += 'Z';
          }

          return {
            ...log,
            checkinTime: new Date(checkinTimeStr)
          };
        });

        this.isLoadingHistory = false;
      },
      error: (err) => {
        this.snackBar.open('Lỗi: Không thể tải lịch sử khách thăm', 'Đóng', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingHistory = false;
        console.error(err);
      }
    });
  }

  populateTimeSlots(): void {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        this.timeSlots.push(`${hour}:${minute}`);
      }
    }
  }
}