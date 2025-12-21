import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface ApartmentDto {
  apartmentId: string;
  buildingId: string;
  code: string;
  type: string | null;
  status: string;
  area: number | null;
  createdAt: string | null;
}
export interface VisitLogStaffViewDto {
  visitLogId: string;
  checkinTime: string;
  checkoutTime: string | null;
  purpose: string | null;
  status: string;
  apartmentCode: string;
  visitorFullName: string;
  visitorIdNumber: string | null;
  visitorPhone?: string | null;
}
export interface VisitLogUpdateDto {
  fullName: string;
  phone: string;
  idNumber: string;
  purpose: string;
  checkinTime: string;
}
export interface VisitorQueryParams {
  buildingId?: string | null;
  apartmentId?: string | null;
  searchTerm?: string | null;
  sortColumn?: string | null;
  sortDirection?: string | null;
  pageNumber: number;
  pageSize: number;
}

export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface VisitorCreateDto {
  fullName?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  apartmentId?: string | null;
  purpose?: string | null;
  checkinTime?: string | null;
  status?: string | null;
}

export interface VisitorDto {
  visitorId: string;
  fullName: string;
  phone: string;
  idNumber: string;
  isUpdated?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
private apiBaseUrl = environment.apiUrl;
  
  // Đổi tất cả trỏ về VisitLogs vì bạn đã gộp Controller
  private visitLogApiUrl = `${this.apiBaseUrl}/VisitLogs`;
  private apartmentApiUrl = `${this.apiBaseUrl}/Apartments`;

  constructor(private http: HttpClient) { }

  // 1. [STAFF] Lấy tất cả nhật ký (Sửa URL)
  getStaffVisitLogs(params: VisitorQueryParams): Observable<PagedList<VisitLogStaffViewDto>> {
    const httpParams = this.createHttpParams(params);
    return this.http.get<ApiResponse<PagedList<VisitLogStaffViewDto>>>(`${this.visitLogApiUrl}/all`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // 2. [RESIDENT] Lấy lịch sử của chính mình (Giữ nguyên)
  getResidentVisitHistory(params: VisitorQueryParams): Observable<PagedList<VisitLogStaffViewDto>> {
    const httpParams = this.createHttpParams(params);
    return this.http.get<ApiResponse<PagedList<VisitLogStaffViewDto>>>(`${this.visitLogApiUrl}/my-history`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // 3. Lấy danh sách khách cũ (QUAN TRỌNG: Đổi từ /Visitors sang /VisitLogs)
  getRecentVisitors(): Observable<VisitorDto[]> {
    return this.http.get<VisitorDto[]>(`${this.visitLogApiUrl}/recent`);
  }

  // 4. Đăng ký khách mới (QUAN TRỌNG: Đổi từ /Visitors sang /VisitLogs)
  createVisitor(dto: VisitorCreateDto): Observable<VisitorDto> {
    return this.http.post<VisitorDto>(`${this.visitLogApiUrl}/fast-checkin`, dto);
  }
checkVisitorExist(idNumber: string) {
  return this.http.get<any>(`${this.visitLogApiUrl}/check-visitor/${idNumber}`);
}
  // 5. Cập nhật thông tin khách (Giữ nguyên URL nhưng logic Backend đã được bạn sửa lỗi Duplicate)
  updateVisitLog(id: string, dto: VisitLogUpdateDto): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.visitLogApiUrl}/${id}/info`, dto);
  }

  // 6. Các thao tác khác (Giữ nguyên)
  checkInVisitor(visitLogId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.visitLogApiUrl}/${visitLogId}/checkin`, {});
  }

  checkOutVisitor(visitLogId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.visitLogApiUrl}/${visitLogId}/checkout`, {});
  }

  deleteVisitLog(id: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.visitLogApiUrl}/${id}`);
  }

  getAllApartments(buildingId?: string): Observable<ApartmentDto[]> {
    let params = new HttpParams().set('pageSize', '5000').set('sortBy', 'code');
    if (buildingId) params = params.set('buildingId', buildingId);
    return this.http.get<ApiResponse<ApartmentDto[]>>(`${this.apartmentApiUrl}/my-buildings`, { params })
      .pipe(map(response => response.data));
  }

  // Helper tạo HttpParams
  private createHttpParams(params: VisitorQueryParams): HttpParams {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());
    if (params.buildingId) httpParams = httpParams.set('buildingId', params.buildingId);
    if (params.apartmentId) httpParams = httpParams.set('apartmentId', params.apartmentId);
    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.sortColumn) httpParams = httpParams.set('sortColumn', params.sortColumn);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    return httpParams;
  }
}