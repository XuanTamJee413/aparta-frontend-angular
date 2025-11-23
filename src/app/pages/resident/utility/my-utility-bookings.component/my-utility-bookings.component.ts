import { Component, OnInit } from '@angular/core';
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

  myBookings: UtilityBookingDto[] = [];
  isLoading = false;

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

  // Hàm kiểm tra xem lịch đã "quá hạn" chưa
  isExpired(dateStr: string): boolean {
    const bookingTime = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return bookingTime < now; // Nếu thời gian đặt nhỏ hơn hiện tại -> Đã qua -> True
  }

  // Hàm xử lý hủy
  onCancel(id: string): void {
    if (confirm('Bạn có chắc chắn muốn hủy lịch đặt này không?')) {
      this.isLoading = true; // Tạm thời loading nhẹ
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          alert('Đã hủy thành công!');
          this.loadHistory(); // Tải lại danh sách
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          alert(err.error?.message || 'Lỗi khi hủy đơn.');
        }
      });
    }
}
}