import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// Import Models
import { UtilityDto } from '../../../../models/utility.model';
import { UtilityBookingCreateDto, UtilityQueryParameters } from '../../../../models/utility-booking.model';

import { UtilityService } from '../../../../services/operation/utility.service';
import { UtilityBookingService } from '../../../../services/resident/utility-booking.service';

// Import Services


@Component({
  selector: 'app-book-utility',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-utility.component.html',
  styleUrls: ['./book-utility.component.css']
})
export class BookUtilityComponent implements OnInit {

  @ViewChild('bookingDialog') dialog!: ElementRef<HTMLDialogElement>;

  utilities: UtilityDto[] = [];
  selectedUtility: UtilityDto | null = null;
  bookingForm: FormGroup;
  
  isLoading = false;
  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  constructor(
    private utilityService: UtilityService,
    private bookingService: UtilityBookingService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: ['', Validators.required], // Giờ bắt đầu
      bookedAt: ['', Validators.required],    // Giờ kết thúc
      residentNote: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableUtilities();
  }

  loadAvailableUtilities(): void {
    // Lấy tất cả tiện ích đang "Available"
    const params: UtilityQueryParameters = {
      pageNumber: 1,
      pageSize: 100,
      status: 'Available'
    };

    this.utilityService.getUtilities(params).subscribe({
      next: (data) => {
        this.utilities = data.items;
      },
      error: (err) => console.error('Lỗi tải tiện ích:', err)
    });
  }

  openBookingModal(utility: UtilityDto): void {
    this.selectedUtility = utility;
    this.dialogErrorMessage = null;
    this.pageSuccessMessage = null;
    
    // Reset form, đặt giờ mặc định là hiện tại
    const nowStr = this.getLocalIsoString(new Date());
    this.bookingForm.reset({
      bookingDate: nowStr,
      bookedAt: nowStr,
      residentNote: ''
    });
    
    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.selectedUtility = null;
  }

  submitBooking(): void {
    this.dialogErrorMessage = null;
    
    if (this.bookingForm.invalid || !this.selectedUtility) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const val = this.bookingForm.value;
    
    // Validate cơ bản ở frontend: Kết thúc phải sau Bắt đầu
    if (new Date(val.bookedAt) <= new Date(val.bookingDate)) {
      this.dialogErrorMessage = "Thời gian kết thúc phải sau thời gian bắt đầu.";
      return;
    }

    this.isLoading = true;

    const dto: UtilityBookingCreateDto = {
      utilityId: this.selectedUtility.utilityId,
      bookingDate: new Date(val.bookingDate).toISOString(),
      bookedAt: new Date(val.bookedAt).toISOString(),
      residentNote: val.residentNote
    };

    this.bookingService.createBooking(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeDialog();
        this.pageSuccessMessage = `Đã gửi yêu cầu đặt "${this.selectedUtility?.name}" thành công!`;
        setTimeout(() => this.pageSuccessMessage = null, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // Hiển thị lỗi từ Backend (ví dụ: trùng giờ, quá thời gian quy định...)
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi đặt tiện ích.';
      }
    });
  }

  // Helper: Lấy chuỗi ISO local để gán vào input type="datetime-local"
  private getLocalIsoString(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  }
}