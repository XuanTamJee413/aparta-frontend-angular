// src/app/services/operation/utility-booking-management.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  UtilityBookingDto, 
  UtilityBookingUpdateDto, 
  PagedList, 
  UtilityQueryParameters 
} from '../../models/utility-booking.model';

@Injectable({
  providedIn: 'root'
})
export class UtilityBookingManagementService {

  private apiUrl = `${environment.apiUrl}/utilitybookings`;

  constructor(private http: HttpClient) { }

  // Lấy danh sách (Phân trang, lọc)
  getBookings(params: UtilityQueryParameters): Observable<PagedList<UtilityBookingDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<PagedList<UtilityBookingDto>>(this.apiUrl, { params: httpParams });
  }

  // Cập nhật trạng thái (Duyệt/Hủy)
  updateBooking(id: string, dto: UtilityBookingUpdateDto): Observable<UtilityBookingDto> {
    return this.http.put<UtilityBookingDto>(`${this.apiUrl}/${id}`, dto);
  }

  // (Optional) Xóa booking nếu cần thiết
  // deleteBooking(...) 
}