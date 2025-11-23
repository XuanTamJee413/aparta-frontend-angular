// src/app/services/resident/utility-booking.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookedSlotDto, UtilityBookingCreateDto, UtilityBookingDto } from '../../models/utility-booking.model';

@Injectable({
  providedIn: 'root'
})
export class UtilityBookingService {

  private apiUrl = `${environment.apiUrl}/utilitybookings`;

  constructor(private http: HttpClient) { }

  // Tạo booking
  createBooking(bookingDto: UtilityBookingCreateDto): Observable<UtilityBookingDto> {
    return this.http.post<UtilityBookingDto>(this.apiUrl, bookingDto);
  }

  // Lấy lịch sử booking của tôi
  getMyBookings(): Observable<UtilityBookingDto[]> {
    return this.http.get<UtilityBookingDto[]>(`${this.apiUrl}/my`);
  }
  
  cancelBooking(id: string): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getBookedSlots(utilityId: string, date: string): Observable<BookedSlotDto[]> {
  // date format: YYYY-MM-DD
  return this.http.get<BookedSlotDto[]>(`${this.apiUrl}/slots?utilityId=${utilityId}&date=${date}`);
  }
}