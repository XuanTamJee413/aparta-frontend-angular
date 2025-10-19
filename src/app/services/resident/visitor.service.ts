import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interface cho dữ liệu gửi đi, khớp với VisitorCreateDto
export interface VisitorCreatePayload {
  fullName: string;
  phone?: string;
  idNumber?: string;
  apartmentId: string;
  purpose: string;
}

// Interface cho dữ liệu Visitor nhận về
export interface VisitorDto {
  visitorId: string;
  fullName: string | null;
  phone: string | null;
  idNumber: string | null;
}

// Interface cho dữ liệu VisitLog nhận về
export interface VisitLogDto {
  id: string;
  apartmentId: string | null;
  visitorId: string | null;
  checkinTime: string | null; // Dữ liệu trả về là chuỗi ISO date
  checkoutTime: string | null;
  purpose: string | null;
  status: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private http = inject(HttpClient);
  private visitorApiUrl = `${environment.apiUrl}/Visitors`;
  private visitLogApiUrl = `${environment.apiUrl}/VisitLogs`;

  // --- Visitor API Calls ---
  getVisitorById(id: string): Observable<VisitorDto> {
    return this.http.get<VisitorDto>(`${this.visitorApiUrl}/${id}`);
  }
  
  getVisitors(): Observable<VisitorDto[]> {
    return this.http.get<VisitorDto[]>(this.visitorApiUrl);
  }

  registerVisitor(payload: VisitorCreatePayload): Observable<VisitorDto> {
    return this.http.post<VisitorDto>(this.visitorApiUrl, payload);
  }

  // --- VisitLog API Calls ---
  getVisitLogs(): Observable<VisitLogDto[]> {
    return this.http.get<VisitLogDto[]>(this.visitLogApiUrl);
  }
}

