// src/app/services/operation/booking-management.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Import DTOs của Service Booking
import { 
  ServiceBookingDto,
  ServiceBookingUpdateDto,
  PagedList,
  ServiceQueryParameters
} from '../../models/service-booking.model';


@Injectable({
  providedIn: 'root'
})
export class BookingManagementService {

  // API LÀ /servicebookings
  private apiUrl = `${environment.apiUrl}/servicebookings`; 

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách bookings (có phân trang, lọc, search)
   * Tương tự getServices
   */
  getBookings(params: ServiceQueryParameters): Observable<PagedList<ServiceBookingDto>> {
    
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      // Backend của chúng ta search theo Tên Dịch Vụ
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PagedList<ServiceBookingDto>>(this.apiUrl, { params: httpParams });
  }

  /**
   * Cập nhật một booking (Duyệt/Từ chối/Hoàn thành)
   * Tương tự updateService
   */
  updateBooking(id: string, dto: ServiceBookingUpdateDto): Observable<ServiceBookingDto> {
    // Lưu ý: Backend trả về ServiceBookingDto (không phải void)
    return this.http.put<ServiceBookingDto>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Xóa một booking
   * Tương tự deleteService
   */
  deleteBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Ghi chú: Chúng ta không cần addBooking hoặc getBookingById
  // vì Staff không tạo booking và không cần xem chi tiết (đã có trong bảng)
}