import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; // Thêm ViewChild, ElementRef
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilityBookingDto } from '../../../../models/utility-booking.model';
import { UtilityBookingService } from '../../../../services/resident/utility-booking.service';

@Component({
  selector: 'app-my-utility-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-utility-bookings.component.html',
  styleUrls: ['./my-utility-bookings.component.css']
})
export class MyUtilityBookingsComponent implements OnInit {

  @ViewChild('cancelDialog') cancelDialog!: ElementRef<HTMLDialogElement>; // Tham chiếu Dialog

  myBookings: UtilityBookingDto[] = [];
  isLoading = false;
  
  // Biến lưu trạng thái hủy
  bookingIdToCancel: string | null = null;
  cancelErrorMessage: string | null = null;

  constructor(private bookingService: UtilityBookingService) { }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải lịch sử:', err);
        this.isLoading = false;
      }
    });
  }

  isExpired(dateStr: string): boolean {
    const bookingTime = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return bookingTime < now;
  }

  // 1. Hàm mở Dialog xác nhận (Thay thế hàm onCancel cũ)
  openCancelModal(id: string): void {
    this.bookingIdToCancel = id;
    this.cancelErrorMessage = null; // Reset lỗi cũ
    this.cancelDialog.nativeElement.showModal();
  }

  // 2. Hàm đóng Dialog
  closeCancelDialog(): void {
    this.cancelDialog.nativeElement.close();
    this.bookingIdToCancel = null;
  }

  // 3. Hàm thực hiện Hủy (Gọi khi bấm nút "Xác nhận" trong Dialog)
  confirmCancel(): void {
    if (!this.bookingIdToCancel) return;

    this.isLoading = true; // Hiển thị loading trên nút
    
    this.bookingService.cancelBooking(this.bookingIdToCancel).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeCancelDialog(); // Đóng dialog
        alert('Đã hủy thành công!'); // Hoặc dùng Notification đẹp hơn nếu có
        this.loadHistory(); // Tải lại danh sách
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // Hiển thị lỗi ngay trong Dialog
        this.cancelErrorMessage = err.error?.message || 'Lỗi khi hủy đơn.';
      }
    });
  }
  getStatusLabel(status: string): string {
  const map: any = {
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Bị từ chối',
    Cancelled: 'Đã hủy'
  };
  return map[status] || status;
  }
}