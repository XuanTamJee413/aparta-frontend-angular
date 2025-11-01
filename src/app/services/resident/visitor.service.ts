import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- ĐỊNH NGHĨA CÁC INTERFACE (MODEL) ---
// Giữ model ở đây theo yêu cầu của bạn
// Lấy apartment để đổ vào combobox để filter theo apartment
export interface ApartmentDto {
  apartmentId: string;
  buildingId: string;
  code: string; // <-- Sửa từ apartmentCode thành code
  type: string | null;
  status: string;
  area: number | null;
  createdAt: string | null; // (DateTime chuyển thành string)
}
/** Dữ liệu hiển thị cho Staff (đã join) */
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

/** Tham số truy vấn cho API (Pagination, Filter, Sort) */
export interface VisitorQueryParams {
  apartmentId?: string | null;
  searchTerm?: string | null;
  sortColumn?: string | null;
  sortDirection?: string | null;
  pageNumber: number;
  pageSize: number;
}

/** Cấu trúc trả về cho danh sách có phân trang */
export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Lớp bọc (Wrapper) tiêu chuẩn cho mọi phản hồi API */
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T; 
}

/** Dữ liệu (DTO) dùng để TẠO MỚI một lượt thăm */
export interface VisitorCreateDto {
  fullName?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  apartmentId?: string | null;
  purpose?: string | null;
  checkinTime?: string | null;
  status?: string | null;
}

/** Dữ liệu Visitor trả về sau khi tạo mới */
export interface Visitor {
  visitorId: string;
  fullName: string;
  phone: string;
  idNumber: string;
}

/** Dữ liệu căn hộ (dùng cho combobox lọc) */
export interface ApartmentDto {
  apartmentId: string;
  apartmentCode: string;
}

// --- SERVICE CLASS ---

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  // --- Thuộc tính ---

  private apiBaseUrl = environment.apiUrl;
  private visitorApiUrl = `${this.apiBaseUrl}/Visitors`;
  private visitLogApiUrl = `${this.apiBaseUrl}/VisitLogs`;
  private apartmentApiUrl = `${this.apiBaseUrl}/Apartments`;

  constructor(private http: HttpClient) { }

  // --- Các phương thức ---

  /** Lấy danh sách khách thăm (cho Staff) - Có phân trang, lọc, sắp xếp */
  getAllVisitors(params: VisitorQueryParams): Observable<PagedList<VisitLogStaffViewDto>> {
    
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());
    
    if (params.apartmentId) {
      httpParams = httpParams.set('apartmentId', params.apartmentId);
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.sortColumn) {
      httpParams = httpParams.set('sortColumn', params.sortColumn);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    // API trả về ApiResponse<PagedList<...>>, dùng .pipe(map) để bóc lớp 'data'
    return this.http.get<ApiResponse<PagedList<VisitLogStaffViewDto>>>(`${this.visitLogApiUrl}/all`, { params: httpParams })
      .pipe(
        map(response => response.data) 
      );
  }

  /** (Staff) Check-in cho khách */
  checkInVisitor(visitLogId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.visitLogApiUrl}/${visitLogId}/checkin`, {});
  }

  /** (Staff) Check-out cho khách */
  checkOutVisitor(visitLogId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.visitLogApiUrl}/${visitLogId}/checkout`, {});
  }

  /** (Resident/Staff) Tạo khách thăm mới */
  createVisitor(dto: VisitorCreateDto): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.visitorApiUrl}/fast-checkin`, dto);
  }

  
  getAllApartments(): Observable<ApartmentDto[]> {
    // Gọi endpoint [HttpGet] ("api/Apartments")
    // API trả về ApiResponse<IEnumerable<ApartmentDto>>
    // Chúng ta dùng pipe(map) để bóc lớp 'data'
    return this.http.get<ApiResponse<ApartmentDto[]>>(`${this.apartmentApiUrl}`)
      .pipe(
        map(response => response.data)
      );
  }

}