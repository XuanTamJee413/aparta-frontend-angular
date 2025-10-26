import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisitorCreateDto, VisitorService, VisitLogStaffViewDto } from '../../../../../services/resident/visitor.service';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './visitor-list.html',
  styleUrl: './visitor-list.css'
})
export class VisitorList implements OnInit {

  manualVisitorForm!: FormGroup;
  allVisitors: VisitLogStaffViewDto[] = [];
  isLoading = false;
  showManualAddForm = false;

  displayedColumns: string[] = [
    'visitorInfo',
    'apartmentCode',
    'purpose',
    'checkinTime',
    'checkoutTime',
    'status',
    'actions'
  ];

  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.manualVisitorForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: [''],
      idNumber: ['', Validators.required],
      purpose: [''],
      apartmentId: ['', Validators.required]
    });

    this.loadAllVisitors();
  }

  loadAllVisitors(): void {
    this.isLoading = true;
    this.visitorService.getAllVisitors().subscribe({
      next: (data) => {
        this.allVisitors = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading all visitors', err);
        this.snackBar.open('Không thể tải danh sách khách thăm', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onCheckIn(visitor: VisitLogStaffViewDto): void {
    if (visitor.status === 'Checked-in' || visitor.status === 'Checked-out') {
      return;
    }

    this.visitorService.checkInVisitor(visitor.visitLogId).subscribe({
      next: (updatedVisitor) => {
        this.snackBar.open(`Đã check-in cho khách: ${updatedVisitor.visitorFullName}`, 'Đóng', { duration: 2000 });
        this.updateVisitorInList(updatedVisitor);
      },
      error: (err) => {
        this.snackBar.open(err?.error || 'Lỗi: Không thể check-in', 'Đóng', { duration: 3000 });
        console.error(err);
      }
    });
  }

  onCheckOut(visitor: VisitLogStaffViewDto): void {
    if (visitor.status !== 'Checked-in') {
      return;
    }

    this.visitorService.checkOutVisitor(visitor.visitLogId).subscribe({
      next: (updatedVisitor) => {
        this.snackBar.open(`Đã check-out cho khách: ${updatedVisitor.visitorFullName}`, 'Đóng', { duration: 2000 });
        this.updateVisitorInList(updatedVisitor);
      },
      error: (err) => {
        this.snackBar.open(err?.error || 'Lỗi: Không thể check-out', 'Đóng', { duration: 3000 });
        console.error(err);
      }
    });
  }

  private updateVisitorInList(updatedVisitor: VisitLogStaffViewDto): void {
    const index = this.allVisitors.findIndex(v => v.visitLogId === updatedVisitor.visitLogId);
    if (index !== -1) {
      this.allVisitors[index] = updatedVisitor;
      this.allVisitors = [...this.allVisitors]; // Trigger change detection
    }
  }

  onManualSubmit(): void {
    if (this.manualVisitorForm.invalid) {
      this.manualVisitorForm.markAllAsTouched();
      return;
    }

    const dto: VisitorCreateDto = {
      ...this.manualVisitorForm.value,
      checkinTime: new Date().toISOString()
    };

    this.visitorService.createAndCheckInVisitor(dto).subscribe({
      next: (createdVisitor) => {
        this.snackBar.open(`Đã tạo và check-in khách: ${createdVisitor.fullName}`, 'Đóng', {
          duration: 3000
        });
        this.resetManualForm();
        this.showManualAddForm = false;
        this.loadAllVisitors();
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

  resetManualForm(): void {
    this.manualVisitorForm.reset();
  }
}