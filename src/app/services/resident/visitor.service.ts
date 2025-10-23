import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VisitorCreateDto {
  fullName?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  
  apartmentId?: string | null;
  purpose?: string | null;
  checkinTime?: string | null;
  status?: string | null;
}

export interface Visitor {
  visitorId: string;
  fullName: string;
  phone: string;
  idNumber: string;
}

export interface VisitLog {
  visitLogId: string;
  visitorId: string;
  visitorName: string;
  purpose: string;
  checkinTime: Date;
  checkoutTime?: Date;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private apiBaseUrl = environment.apiUrl;
  private visitorApiUrl = `${this.apiBaseUrl}/Visitors`;
  private visitLogApiUrl = `${this.apiBaseUrl}/VisitLogs`;

  constructor(private http: HttpClient) { }

  // POST: api/Visitors
  createVisitor(dto: VisitorCreateDto): Observable<Visitor> {
    return this.http.post<Visitor>(this.visitorApiUrl, dto);
  }
  // GET: api/VisitLogs/apartment/{apartmentId}
  getHistoryForApartment(apartmentId: string): Observable<VisitLog[]> {
    return this.http.get<VisitLog[]>(`${this.visitLogApiUrl}/apartment/${apartmentId}`);
  }
}
