import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VisitorCreatePayload {
  fullName: string;
  phone?: string;
  idNumber?: string;
  apartmentId: string;
  purpose: string;
}

export interface VisitorDto {
  visitorId: string;
  fullName: string | null;
  phone: string | null;
  idNumber: string | null;
}

export interface VisitLogDto {
  id: string;
  apartmentId: string | null;
  visitorId: string | null;
  checkinTime: string | null; 
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

  getVisitors(): Observable<VisitorDto[]> {
    return this.http.get<VisitorDto[]>(this.visitorApiUrl);
  }

  registerVisitor(payload: VisitorCreatePayload): Observable<VisitorDto> {
    return this.http.post<VisitorDto>(this.visitorApiUrl, payload);
  }

  getVisitLogs(): Observable<VisitLogDto[]> {
    return this.http.get<VisitLogDto[]>(this.visitLogApiUrl);
  }
}

