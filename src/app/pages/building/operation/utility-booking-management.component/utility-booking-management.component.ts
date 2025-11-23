import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// Import Models
import { 
  UtilityBookingDto, 
  UtilityBookingUpdateDto, 
  PagedList, 
  UtilityQueryParameters 
} from '../../../../models/utility-booking.model';

// Import Service
import { UtilityBookingManagementService } from '../../../../services/operation/utility-booking-management.service';

@Component({
  selector: 'app-utility-booking-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './utility-booking-management.component.html',
  styleUrls: ['./utility-booking-management.component.css'] // Dùng chung CSS hoặc tạo mới
})
export class UtilityBookingManagementComponent implements OnInit {

  @ViewChild('bookingDialog') dialog!: ElementRef<HTMLDialogElement>;

  bookings: UtilityBookingDto[] = [];
  currentBookingId: string | null = null;
  bookingForm: FormGroup;
  isLoading = false;

  // Pagination & Filter
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  searchControl = new FormControl('');
  statusFilterControl = new FormControl('Pending'); // Mặc định xem đơn chờ duyệt

 statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ duyệt', value: 'Pending' },
    { label: 'Đã duyệt', value: 'Approved' },
    { label: 'Từ chối', value: 'Rejected' },
    { label: 'Đã hủy', value: 'Cancelled' }
  ];

  // Các trạng thái Staff có thể chọn trong Dialog
 dialogStatusOptions = this.statusOptions.filter(o => 
  o.value !== '' && 
  o.value !== 'Pending' && 
  o.value !== 'Cancelled' // <-- Thêm dòng này nếu muốn chặn Staff chọn Hủy
);

  // Messages
  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  constructor(
    private bookingService: UtilityBookingManagementService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      status: ['Approved', Validators.required],
      staffNote: ['']
    });
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    const params: UtilityQueryParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value?.trim() || null,
      status: this.statusFilterControl.value || null
    };

    this.bookingService.getBookings(params).subscribe({
      next: (data: PagedList<UtilityBookingDto>) => {
        this.bookings = data.items;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.currentPage = data.pageNumber;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải utility bookings:', err);
        this.isLoading = false;
      }
    });
  }

  // --- Search & Pagination ---
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

  // --- Update Status ---
  openEditModal(booking: UtilityBookingDto): void {
    if (booking.status === 'Cancelled') {
      alert('Đơn này đã bị hủy, không thể cập nhật.');
      return;
    }

    if (this.isExpired(booking.bookingDate)) {
      alert('Đơn này đã quá thời gian bắt đầu, không thể cập nhật.');
      return;
    }
    this.resetMessages();
    this.currentBookingId = booking.utilityBookingId;
    
    this.bookingForm.patchValue({
      status: booking.status, 
      staffNote: booking.staffNote ?? ''
    });
    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.currentBookingId = null;
  }

  saveBooking(): void {
    this.resetMessages();
    if (this.bookingForm.invalid || !this.currentBookingId) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const dto: UtilityBookingUpdateDto = {
      status: this.bookingForm.value.status,
      staffNote: this.bookingForm.value.staffNote
    };

    this.bookingService.updateBooking(this.currentBookingId, dto).subscribe({
      next: () => {
        this.loadBookings();
        this.closeDialog();
        this.setSuccessMessage('Cập nhật trạng thái thành công!');
      },
      error: (err: HttpErrorResponse) => {
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi cập nhật.';
      }
    });
  }

  // --- Helpers ---
  private resetMessages(): void {
    this.pageSuccessMessage = null;
    this.dialogErrorMessage = null;
  }

  private setSuccessMessage(msg: string): void {
    this.pageSuccessMessage = msg;
    setTimeout(() => this.pageSuccessMessage = null, 3000);
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : status;
  }
  isExpired(dateStr: string): boolean {
    return new Date(dateStr).getTime() < new Date().getTime();
  }
}