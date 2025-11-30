import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// THÊM HttpErrorResponse
import { HttpErrorResponse } from '@angular/common/http';

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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Filter
  searchControl = new FormControl('');
  statusFilterControl = new FormControl('Pending'); 

  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ duyệt', value: 'Pending' },
    { label: 'Đã duyệt (Tạo Task)', value: 'Approved' }, // Update label cho rõ nghĩa
    { label: 'Hoàn thành', value: 'Completed' },
    { label: 'Đã hủy', value: 'Cancelled' }
  ];

  dialogStatusOptions = this.statusOptions.filter(o => o.value !== '' && o.value !== 'Pending');

  // THÊM BIẾN THÔNG BÁO
  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  constructor(
    private bookingService: BookingManagementService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      status: ['Approved', Validators.required],
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

  onSearch(): void { this.currentPage = 1; this.loadBookings(); }
  onFilterChange(): void { this.currentPage = 1; this.loadBookings(); }
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBookings();
    }
  }
  get hasPreviousPage(): boolean { return this.currentPage > 1; }
  get hasNextPage(): boolean { return this.currentPage < this.totalPages; }

  openEditModal(booking: ServiceBookingDto): void {
    // Reset thông báo
    this.dialogErrorMessage = null;
    this.pageSuccessMessage = null;

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
    this.currentBookingId = null;
  }

  // Hàm này để reset form khi đóng hoàn toàn
  onDialogClose(): void {
    this.bookingForm.reset({ status: 'Approved', paymentAmount: 0, staffNote: '' });
    this.currentBookingId = null;
  }

  saveBooking(): void {
    this.dialogErrorMessage = null; // Reset lỗi cũ

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
        
        // Thông báo thông minh hơn
        let msg = 'Cập nhật trạng thái thành công!';
        if (formValue.status === 'Approved') {
          msg = 'Đã duyệt đơn và tạo Task mới thành công. Vui lòng vào mục Quản lý Công việc để phân công.';
        }
        this.setSuccessMessage(msg);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi cập nhật booking:', err);
        // Hiển thị lỗi từ backend (ví dụ: Task đã tồn tại, lỗi DB...)
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi cập nhật. Vui lòng thử lại.';
      }
    });
  }

  // Hàm helper
  private setSuccessMessage(msg: string): void {
    this.pageSuccessMessage = msg;
    // Tự tắt sau 5 giây (lâu hơn xíu để đọc nếu thông báo dài)
    setTimeout(() => this.pageSuccessMessage = null, 5000); 
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : status;
  }
}