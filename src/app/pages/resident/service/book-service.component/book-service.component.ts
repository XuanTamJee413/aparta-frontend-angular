import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ServiceDto } from '../../../../models/service.model';
import { ServiceBookingCreateDto, ServiceBookingDto } from '../../../../models/service-booking.model';
import { ServiceBookingService } from '../../../../services/resident/service-booking.service';

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-service.component.html',
  styleUrls: ['./book-service.component.css']
})
export class BookServiceComponent implements OnInit {

  @ViewChild('bookingDialog') dialog!: ElementRef<HTMLDialogElement>;

  availableServices: ServiceDto[] = [];
  bookingForm: FormGroup;
  selectedService: ServiceDto | null = null;
  
  // Trạng thái loading
  isLoading = false;      // Cho việc đặt mới
  isHistoryLoading = false; // Cho việc tải lịch sử
  
  errorMessage = '';
  successMessage = '';

  myBookings: ServiceBookingDto[] = [];

  constructor(
    private fb: FormBuilder,
    private bookingService: ServiceBookingService
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: [this.getNowISO(), Validators.required],
      residentNote: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableServices();
    this.loadHistory();
  }

  // --- 1. PHẦN TẢI DỮ LIỆU ---
  loadAvailableServices(): void {
    this.bookingService.getAvailableServices().subscribe({
      next: (data) => {
        this.availableServices = data.items;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load services.';
      }
    });
  }

  loadHistory(): void {
    this.isHistoryLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings = data;
        this.isHistoryLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isHistoryLoading = false;
      }
    });
  }

  // --- 2. PHẦN ĐẶT DỊCH VỤ ---
  openBookingModal(service: ServiceDto): void {
    this.selectedService = service;
    this.bookingForm.reset({
      bookingDate: this.getNowISO(),
      residentNote: ''
    });
    this.errorMessage = '';
    this.successMessage = '';
    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.selectedService = null;
  }

  onSubmitBooking(): void {
    if (this.bookingForm.invalid || !this.selectedService) return;

    this.isLoading = true;
    const formValue = this.bookingForm.value;
    const serviceName = this.selectedService.name;

    const bookingDto: ServiceBookingCreateDto = {
      serviceId: this.selectedService.serviceId,
      bookingDate: new Date(formValue.bookingDate).toISOString(),
      residentNote: formValue.residentNote
    };

    this.bookingService.createBooking(bookingDto).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = `Đặt dịch vụ "${serviceName}" thành công!`;
        
        setTimeout(() => {
          this.closeDialog();
          this.successMessage = '';
        }, 1500);

        this.loadHistory(); // Tải lại lịch sử sau khi đặt
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Lỗi khi đặt dịch vụ.';
        this.isLoading = false;
      }
    });
  }

  // --- 3. PHẦN HỦY DỊCH VỤ (MỚI THÊM) ---
  
  // Chỉ cho phép hủy khi trạng thái là Pending
  // Trong file book-service.component.ts

// Cập nhật hàm này
canCancel(status: string, bookingDate: string): boolean {
  // 1. Phải là trạng thái Pending
  if (status !== 'Pending') {
    return false;
  }

  // 2. LOGIC MỚI: Phải chưa đến giờ thực hiện
  const bookingTime = new Date(bookingDate).getTime();
  const now = new Date().getTime();

  // Nếu thời gian đặt > thời gian hiện tại => Chưa quá giờ => Được hủy
  return bookingTime > now;
}

  onCancelBooking(bookingId: string): void {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn đặt dịch vụ này không?')) {
      return;
    }

    // Sử dụng isHistoryLoading để hiện trạng thái chờ trên bảng
    this.isHistoryLoading = true; 

    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        alert('Đã hủy đơn thành công!');
        this.loadHistory(); // Tải lại để cập nhật trạng thái
      },
      error: (err: HttpErrorResponse) => {
        this.isHistoryLoading = false;
        const msg = err.error?.message || 'Có lỗi xảy ra khi hủy đơn.';
        alert(msg);
      }
    });
  }

  // --- HELPERS ---
  getStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      Pending: 'Chờ duyệt',
      Approved: 'Đã duyệt',
      Rejected: 'Bị từ chối',
      Cancelled: 'Đã hủy'
    };
    return map[status] || status;
  }

  private getNowISO(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset);
    return localDate.toISOString().slice(0, 16); 
  }
}