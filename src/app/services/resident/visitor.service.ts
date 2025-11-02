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
}

export interface VisitorQueryParams {
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

export interface Visitor {
  visitorId: string;
  fullName: string;
  phone: string;
  idNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private apiBaseUrl = environment.apiUrl;
  private visitorApiUrl = `${this.apiBaseUrl}/Visitors`;
  private visitLogApiUrl = `${this.apiBaseUrl}/VisitLogs`;
  private apartmentApiUrl = `${this.apiBaseUrl}/Apartments`;

  constructor(private http: HttpClient) { }

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

    return this.http.get<ApiResponse<PagedList<VisitLogStaffViewDto>>>(`${this.visitLogApiUrl}/all`, { params: httpParams })
      .pipe(
        map(response => response.data) 
      );
  }

  checkInVisitor(visitLogId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.visitLogApiUrl}/${visitLogId}/checkin`, {});
  }

  checkOutVisitor(visitLogId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.visitLogApiUrl}/${visitLogId}/checkout`, {});
  }

  createVisitor(dto: VisitorCreateDto): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.visitorApiUrl}/fast-checkin`, dto);
  }

  
  getAllApartments(): Observable<ApartmentDto[]> {
    return this.http.get<ApiResponse<ApartmentDto[]>>(`${this.apartmentApiUrl}`)
      .pipe(
        map(response => response.data)
      );
  }

}