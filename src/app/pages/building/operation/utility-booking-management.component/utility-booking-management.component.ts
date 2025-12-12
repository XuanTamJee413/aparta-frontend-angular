import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { 
  UtilityBookingDto, 
  UtilityBookingUpdateDto, 
  PagedList, 
  UtilityQueryParameters 
} from '../../../../models/utility-booking.model';
import { UtilityBookingManagementService } from '../../../../services/operation/utility-booking-management.service';

@Component({
  selector: 'app-utility-booking-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './utility-booking-management.component.html',
  styleUrls: ['./utility-booking-management.component.css']
})
export class UtilityBookingManagementComponent implements OnInit {

  @ViewChild('rejectDialog') dialog!: ElementRef<HTMLDialogElement>; // Đổi tên tham chiếu cho rõ nghĩa

  bookings: UtilityBookingDto[] = [];
  currentBookingId: string | null = null;
  rejectForm: FormGroup; // Đổi tên form
  isLoading = false;

  // Pagination & Filter
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  searchControl = new FormControl('');
  
  // YÊU CẦU: Không mặc định filter pending nữa -> Để rỗng (Tất cả)
  statusFilterControl = new FormControl(''); 

  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đã duyệt (Approved)', value: 'Approved' }, // Auto approve nên đây là trạng thái chính
    { label: 'Từ chối (Rejected)', value: 'Rejected' },
    { label: 'Đã hủy (Cancelled)', value: 'Cancelled' }
  ];

  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  constructor(
    private bookingService: UtilityBookingManagementService,
    private fb: FormBuilder
  ) {
    // Form chỉ cần nhập lý do từ chối
    this.rejectForm = this.fb.group({
      staffNote: ['', [Validators.required, Validators.minLength(5)]] // Bắt buộc nhập lý do
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

  // --- Logic Mới: Từ chối đơn ---
  
  // Helper kiểm tra điều kiện hiển thị nút Từ chối
  canReject(booking: UtilityBookingDto): boolean {
    // 1. Không thể từ chối đơn đã Hủy hoặc đã Từ chối trước đó
    if (booking.status === 'Cancelled' || booking.status === 'Rejected') {
      return false;
    }
    // 2. Không thể từ chối nếu thời gian bắt đầu đã qua (User yêu cầu: trước giờ bắt đầu)
    if (this.isExpired(booking.bookingDate)) {
      return false;
    }
    return true;
  }

  openRejectModal(booking: UtilityBookingDto): void {
    if (!this.canReject(booking)) return;

    this.resetMessages();
    this.currentBookingId = booking.utilityBookingId;
    this.rejectForm.reset(); // Reset form trắng
    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.currentBookingId = null;
  }

  confirmReject(): void {
    this.resetMessages();
    
    if (this.rejectForm.invalid || !this.currentBookingId) {
      this.rejectForm.markAllAsTouched();
      return;
    }

    // Hardcode status là 'Rejected'
    const dto: UtilityBookingUpdateDto = {
      status: 'Rejected',
      staffNote: this.rejectForm.value.staffNote
    };

    this.bookingService.updateBooking(this.currentBookingId, dto).subscribe({
      next: () => {
        this.loadBookings(); // Tải lại danh sách
        this.closeDialog();
        this.setSuccessMessage('Đã từ chối đơn đăng ký thành công.');
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
    const map: any = {
      Approved: 'Đã duyệt (Auto)',
      Rejected: 'Đã từ chối',
      Cancelled: 'Đã hủy',
      Pending: 'Chờ xử lý' // Đề phòng dữ liệu cũ
    };
    return map[status] || status;
  }

  isExpired(dateStr: string): boolean {
    return new Date(dateStr).getTime() < new Date().getTime();
  }
}