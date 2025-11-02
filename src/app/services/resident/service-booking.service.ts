import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedList, ServiceDto } from '../../models/service.model';
import { ServiceBookingCreateDto, ServiceBookingDto } from '../../models/service-booking.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceBookingService {


  private serviceApiUrl = `${environment.apiUrl}/Service`; 

  private bookingApiUrl = `${environment.apiUrl}/servicebookings`;

  constructor(private http: HttpClient) { }

  getAvailableServices(): Observable<PagedList<ServiceDto>> {
    const params = new HttpParams()
      .set('status', 'Available')
      .set('pageNumber', '1')
      .set('pageSize', '100'); 
    return this.http.get<PagedList<ServiceDto>>(this.serviceApiUrl, { params });
  }

  createBooking(bookingDto: ServiceBookingCreateDto): Observable<ServiceBookingDto> {
    return this.http.post<ServiceBookingDto>(this.bookingApiUrl, bookingDto);
  }

  getMyBookings(): Observable<ServiceBookingDto[]> {
    return this.http.get<ServiceBookingDto[]>(`${this.bookingApiUrl}/my`);
  }
}