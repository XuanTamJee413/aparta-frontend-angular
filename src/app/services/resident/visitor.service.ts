import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Nhận dữ liệu đã join từ API: visitorlogs/all.

export interface VisitLogStaffViewDto {
  visitLogId: string;
  checkinTime: string;
  checkoutTime: string | null;
  purpose: string | null;
  status: string;
  apartmentCode: string;
  visitorFullName: string;
  visitorIdNumber: string | null;
}


// Dùng cho cả Cư dân (đăng ký khách) và Nhân viên (check-in vãng lai).

export interface VisitorCreateDto {
  fullName?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  apartmentId?: string | null;
  purpose?: string | null;
  checkinTime?: string | null;
  status?: string | null;
}


// API trả về sau khi tạo mới Visitor thành công.

export interface Visitor {
  visitorId: string;
  fullName: string;
  phone: string;
  idNumber: string;
}


// lấy apartment-code đổ vào combobox.

export interface ApartmentDto {
  apartmentId: string;
  apartmentCode: string;
}

// --- Service Class ---

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  // --- Properties ---

  private apiBaseUrl = environment.apiUrl;
  private visitorApiUrl = `${this.apiBaseUrl}/Visitors`;
  private visitLogApiUrl = `${this.apiBaseUrl}/VisitLogs`;
  // private apartmentApiUrl = `${this.apiBaseUrl}/Apartments`;

  constructor(private http: HttpClient) { }

  getAllVisitors(): Observable<VisitLogStaffViewDto[]> {
    return this.http.get<VisitLogStaffViewDto[]>(`${this.visitLogApiUrl}/all`);
  }


  checkInVisitor(visitLogId: string): Observable<any> {
    return this.http.put(`${this.visitLogApiUrl}/${visitLogId}/checkin`, {});
  }


  checkOutVisitor(visitLogId: string): Observable<any> {
    return this.http.put(`${this.visitLogApiUrl}/${visitLogId}/checkout`, {});
  }


  createVisitor(dto: VisitorCreateDto): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.visitorApiUrl}/fast-checkin`, dto);
  }

 

  // getAllApartments(): Observable<ApartmentDto[]> {
  //   return this.http.get<ApartmentDto[]>(`${this.apartmentApiUrl}/all`);
  // }

}