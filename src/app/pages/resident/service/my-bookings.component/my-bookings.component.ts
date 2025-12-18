import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http'; // Thêm import này để xử lý lỗi
import { ServiceBookingDto } from '../../../../models/service-booking.model';
import { ServiceBookingService } from '../../../../services/resident/service-booking.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {

  myBookings: ServiceBookingDto[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private bookingService: ServiceBookingService) { }

  ngOnInit(): void {
    this.loadMyBookings();
  }

  loadMyBookings(): void {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load booking history.';
        this.isLoading = false;
      }
    });
  }

  // --- THÊM CÁC HÀM DƯỚI ĐÂY ---

  // Kiểm tra xem có được phép hủy không (Chỉ Pending mới được hủy)
  canCancel(status: string): boolean {
    return status === 'Pending';
  }

  onCancelBooking(bookingId: string): void {
    // 1. Xác nhận đơn giản bằng window.confirm (hoặc dùng Dialog nếu muốn đẹp hơn)
    if (!confirm('Bạn có chắc chắn muốn hủy đơn đặt dịch vụ này không?')) {
      return;
    }

    this.isLoading = true; // Hiển thị loading trong lúc chờ

    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        alert('Đã hủy đơn thành công!');
        this.loadMyBookings(); // Tải lại danh sách để cập nhật trạng thái
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        // Hiển thị thông báo lỗi từ Backend trả về
        const msg = err.error?.message || 'Có lỗi xảy ra khi hủy đơn.';
        alert(msg);
      }
    });
  }
}