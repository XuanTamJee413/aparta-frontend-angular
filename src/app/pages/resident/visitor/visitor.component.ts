import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VisitLog, VisitorCreateDto, VisitorService } from '../../../services/resident/visitor.service';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';

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
  styleUrls: ['./visitor.component.css']
})
export class VisitorComponent implements OnInit {

  visitorForm!: FormGroup;
  private residentApartmentId: string = ''; 
  history: VisitLog[] = [];
  isLoadingHistory = false;
  displayedColumns: string[] = ['visitorName', 'purpose', 'checkinTime', 'status', 'actions'];
  timeSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const userPayload = this.auth.user();

  if (userPayload && userPayload.apartment_id) {
    this.residentApartmentId = String(userPayload.apartment_id); 
  } else {
    console.error('Không tìm thấy apartment_id của cư dân.');
    this.snackBar.open('Lỗi: Không thể xác định căn hộ của bạn.', 'Đóng', { 
      duration: 3000,
      panelClass: ['error-snackbar'] 
    });
    return; 
  }
    this.populateTimeSlots();

    this.visitorForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: [''],
      idNumber: ['', Validators.required],
      purpose: [''],
      checkinDate: [new Date(), Validators.required],
      checkinTime: ['12:00', Validators.required] 
    });

    this.loadHistory();
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

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.visitorService.getHistoryForApartment(this.residentApartmentId).subscribe({
      next: (data) => {
        this.history = data.sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime());
        this.isLoadingHistory = false;
      },
      error: (err) => {
        console.error('Error loading history', err);
        this.snackBar.open('Không thể tải lịch sử khách thăm', 'Đóng', { duration: 3000 });
        this.isLoadingHistory = false;
      }
    });
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
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );

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
      
      checkinTime: localISOString 
    };

    this.visitorService.createVisitor(dto).subscribe({
      next: (createdVisitor) => {
        this.snackBar.open(`Đã đăng ký khách: ${createdVisitor.fullName}`, 'Đóng', {
          duration: 3000
        });
        this.resetForm();
        this.loadHistory();
      },
      error: (err) => {
        this.snackBar.open('Lỗi: Không thể đăng ký khách', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error(err);
      }
    });
  }

  resetForm(): void {
    this.visitorForm.reset({
      checkinDate: new Date(),
      checkinTime: '12:00'
    });
  }

  editVisit(log: VisitLog): void {
    this.snackBar.open(`Sửa: ${log.visitorName}`, 'Đóng', { duration: 2000 });
  }

  deleteVisit(log: VisitLog): void {
    this.snackBar.open(`Xóa: ${log.visitorName}`, 'Đóng', { duration: 2000 });
  }
}