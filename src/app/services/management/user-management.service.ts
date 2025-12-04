import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces ---
export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface StaffCreateDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  staffCode?: string;
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
}

export interface UserQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}
export interface RoleDto {
  roleId: string;
  roleName: string;
  isSystemDefined?: boolean;
  isActive?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
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

  // 1. Lấy danh sách Nhân viên
  getStaffAccounts(params: UserQueryParams): Observable<ApiResponse<PagedList<UserAccountDto>>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedList<UserAccountDto>>>(`${this.apiUrl}/staffs`, { params: httpParams });
  }

  // 2. Lấy danh sách Cư dân
  getResidentAccounts(params: UserQueryParams): Observable<ApiResponse<PagedList<UserAccountDto>>> {
    const httpParams = this.buildParams(params);
    return this.http.get<ApiResponse<PagedList<UserAccountDto>>>(`${this.apiUrl}/residents`, { params: httpParams });
  }
  
  // 3. Toggle Status
  toggleUserStatus(userId: string, status: { status: 'Active' | 'Inactive' }): Observable<ApiResponse<UserAccountDto>> {
    return this.http.put<ApiResponse<UserAccountDto>>(`${this.apiUrl}/${userId}/status`, status);
  }

  // 4. Tạo Staff Mới (Thêm hàm này)
  // DTO StaffCreateDto nên được import hoặc định nghĩa. Ở đây dùng any cho linh hoạt nếu chưa có file model
  // CREATE Staff
  createStaffAccount(dto: StaffCreateDto): Observable<ApiResponse<UserAccountDto>> {
    return this.http.post<ApiResponse<UserAccountDto>>(`${this.apiUrl}/staffs`, dto);
  }
  getAllRoles(): Observable<ApiResponse<RoleDto[]>> {
    // Gọi vào: api/Roles (Method GET)
    return this.http.get<ApiResponse<RoleDto[]>>(this.apiUrl);
  }
}