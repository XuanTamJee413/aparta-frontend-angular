import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceDto, ServiceCreateDto, ServiceUpdateDto } from '../../models/service.model';
import { environment } from '../../../environments/environment'; // 1. Import environment

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  // 2. Lấy URL của API từ file environment
  private apiUrl = `${environment.apiUrl}/Service`; 

  constructor(private http: HttpClient) { }

  // GET: api/Service
  getServices(): Observable<ServiceDto[]> {
    return this.http.get<ServiceDto[]>(this.apiUrl);
  }

  // GET: api/Service/{id}
  getServiceById(id: string): Observable<ServiceDto> {
    return this.http.get<ServiceDto>(`${this.apiUrl}/${id}`);
  }

  // POST: api/Service
  addService(service: ServiceCreateDto): Observable<ServiceDto> {
    return this.http.post<ServiceDto>(this.apiUrl, service);
  }

  // PUT: api/Service/{id}
  updateService(id: string, service: ServiceUpdateDto): Observable<void> {
    // PUT thường trả về 204 No Content, nên kiểu trả về là void
    return this.http.put<void>(`${this.apiUrl}/${id}`, service);
  }

  // DELETE: api/Service/{id}
  deleteService(id: string): Observable<void> {
    // DELETE thường trả về 204 No Content
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}