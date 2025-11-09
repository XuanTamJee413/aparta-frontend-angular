// src/app/pages/operation/booking-management/booking-management.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { ServiceBookingDto, ServiceBookingUpdateDto, PagedList, ServiceQueryParameters } from '../../../../models/service-booking.model';
import { BookingManagementService } from '../../../../services/operation/booking-management.service';

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-management.component.html',
  styleUrls: ['./booking-management.component.css']
})
export class BookingManagementComponent implements OnInit {

  @ViewChild('bookingDialog') dialog!: ElementRef<HTMLDialogElement>;

  bookings: ServiceBookingDto[] = [];
  currentBookingId: string | null = null;
  bookingForm: FormGroup;
  isLoading = false;

  // Phân trang
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Lọc
  searchControl = new FormControl('');
  statusFilterControl = new FormControl('Pending'); // Mặc định: Chờ duyệt

  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ duyệt', value: 'Pending' },
    { label: 'Đã duyệt', value: 'Approve' },
    { label: 'Hoàn thành', value: 'Completed' },
    { label: 'Đã hủy', value: 'Cancelled' }
  ];

  // Chỉ cho phép staff chọn các trạng thái này
  dialogStatusOptions = this.statusOptions.filter(o => o.value !== '' && o.value !== 'Pending');

  constructor(
    private bookingService: BookingManagementService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      status: ['Approve', Validators.required],
      paymentAmount: [0, [Validators.required, Validators.min(0)]],
      staffNote: ['']
    });
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    const params: ServiceQueryParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value?.trim() || null,
      status: this.statusFilterControl.value || null
    };

    this.bookingService.getBookings(params).subscribe({
      next: (data: PagedList<ServiceBookingDto>) => {
        this.bookings = data.items;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.currentPage = data.pageNumber;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải bookings:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBookings();
    }
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  openEditModal(booking: ServiceBookingDto): void {
    this.currentBookingId = booking.serviceBookingId;
    this.bookingForm.patchValue({
      status: booking.status,
      paymentAmount: booking.paymentAmount ?? 0,
      staffNote: booking.staffNote ?? ''
    });
    this.dialog.nativeElement.showModal();
  }

  hideDialog(): void {
    this.dialog.nativeElement.close();
  }

  onDialogClose(): void {
    this.bookingForm.reset({ status: 'Approve', paymentAmount: 0, staffNote: '' });
    this.currentBookingId = null;
  }

  saveBooking(): void {
    if (this.bookingForm.invalid || !this.currentBookingId) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const formValue = this.bookingForm.value;
    const updateDto: ServiceBookingUpdateDto = {
      status: formValue.status,
      paymentAmount: formValue.paymentAmount,
      staffNote: formValue.staffNote
    };

    this.bookingService.updateBooking(this.currentBookingId, updateDto).subscribe({
      next: () => {
        this.loadBookings();
        this.hideDialog();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật booking:', err);
      }
    });
  }

  delete(id: string): void {
    if (confirm('Bạn có chắc muốn xóa đơn booking này?')) {
      this.bookingService.deleteBooking(id).subscribe({
        next: () => {
          if (this.bookings.length === 1 && this.currentPage > 1) {
            this.currentPage--;
          }
          this.loadBookings();
        },
        error: (err) => console.error('Lỗi khi xóa:', err)
      });
    }
  }

  getStatusLabel(status: string): string {
  const option = this.statusOptions.find(o => o.value === status);
  return option ? option.label : status;
}
}