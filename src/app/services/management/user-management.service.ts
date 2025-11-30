/* --- File: src/app/services/user-management.service.ts (Đã sửa) --- */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// Import environment
import { environment } from '../../../environments/environment';

// [NOTE] Các Interfaces được giữ nguyên như bạn đã cung cấp
export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserAccountDto {
  userId: string;
  name: string;
  email: string;
  phone: string;
  roleName: string;
  status: string; 
  staffCode: string | null;
  apartmentCode: string | null; 
  assignedBuildingCodes: string[]; 
  createdAt: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  code: string;
  data: T;
  totalRecords?: number;
}

export interface UserQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}


@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  // FIX: Sử dụng environment.apiUrl để tạo URL
  private apiUrl = environment.apiUrl + '/UserManagement';

  constructor(private http: HttpClient) { }

  private buildParams(params: UserQueryParams): HttpParams {
    let httpParams = new HttpParams()
      .set('PageNumber', params.pageNumber.toString())
      .set('PageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('SearchTerm', params.searchTerm);
    }
    if (params.status) {
      httpParams = httpParams.set('Status', params.status);
    }
    if (params.sortColumn) {
      httpParams = httpParams.set('SortColumn', params.sortColumn);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('SortDirection', params.sortDirection);
    }

    return httpParams;
  }

  // API lấy danh sách Nhân viên
  getStaffAccounts(params: UserQueryParams): Observable<ApiResponse<PagedList<UserAccountDto>>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedList<UserAccountDto>>>(`${this.apiUrl}/staffs`, { params: httpParams });
  }

  // API lấy danh sách Cư dân
  getResidentAccounts(params: UserQueryParams): Observable<ApiResponse<PagedList<UserAccountDto>>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedList<UserAccountDto>>>(`${this.apiUrl}/residents`, { params: httpParams });
  }
  
  // API Toggle Status
  toggleUserStatus(userId: string, status: { status: 'Active' | 'Inactive' }): Observable<ApiResponse<UserAccountDto>> {
    return this.http.put<ApiResponse<UserAccountDto>>(`${this.apiUrl}/${userId}/status`, status);
  }
}