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

import { 
  VisitorCreateDto, 
  VisitorService, 
  VisitLogStaffViewDto, 
  VisitorQueryParams 
} from '../../../services/resident/visitor.service';
import { AuthService } from '../../../services/auth.service';

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
    MatProgressSpinnerModule
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
  
  private residentApartmentId: string = ''; 
  
  isLoadingHistory = false; 
  displayedColumns: string[] = ['visitorFullName', 'purpose', 'checkinTime', 'status', 'actions'];
  history: any[] = []; 
  
  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService,
    private snackBar: MatSnackBar,
    private auth: AuthService
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
    const combinedCheckinTime = new Date(
      date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes
    );

    if (combinedCheckinTime <= new Date()) {
        this.snackBar.open('Lỗi: Ngày hoặc giờ đến phải ở trong tương lai.', 'Đóng', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
        return;
    }

    const pad = (num: number) => num.toString().padStart(2, '0');
    const localISOString = 
        `${combinedCheckinTime.getFullYear()}-` +
        `${pad(combinedCheckinTime.getMonth() + 1)}-` +
        `${pad(combinedCheckinTime.getDate())}T` +
        `${pad(combinedCheckinTime.getHours())}:` +
        `${pad(combinedCheckinTime.getMinutes())}:` +
        `${pad(combinedCheckinTime.getSeconds())}`;
        
    const dto: VisitorCreateDto = {
      fullName: this.visitorForm.value.fullName,
      phone: this.visitorForm.value.phone,
      idNumber: this.visitorForm.value.idNumber,
      purpose: this.visitorForm.value.purpose,
      apartmentId: this.residentApartmentId, 
      checkinTime: localISOString,
      status: 'Pending' 
    };

    this.visitorService.createVisitor(dto).subscribe({
      next: (createdVisitor) => {
        this.snackBar.open(`Đã đăng ký khách: ${createdVisitor.fullName}`, 'Đóng', {
          duration: 3000,
          panelClass: ['success-snackbar'] 
        });
        this.resetForm();
        this.loadHistory(); 
      },
      error: (err) => {
        let errorMessage = 'Lỗi: Không thể đăng ký khách';
        if (err.error && err.error.message) {
            errorMessage = err.error.message;
        } else if (err.error && err.error.errors) {
            const beErrors = err.error.errors;
            const firstErrorKey = Object.keys(beErrors)[0];
            errorMessage = beErrors[firstErrorKey][0];
        }
        
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error(err);
      }
    });
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

    this.visitorService.getAllVisitors(params).subscribe({
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

  editVisit(log: VisitLogStaffViewDto): void {
    console.log('Sửa:', log);
    this.snackBar.open('Chức năng sửa đang được phát triển.', 'Đóng', { duration: 2000 });
  }

  deleteVisit(log: VisitLogStaffViewDto): void {
    console.log('Xóa:', log);
    this.snackBar.open('Chức năng xóa đang được phát triển.', 'Đóng', { duration: 2000 });
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