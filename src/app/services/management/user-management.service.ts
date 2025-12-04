import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces (DTOs Matching Backend) ---

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  // code: string; // Backend Refactor có thể không trả về code ở root level, tùy vào ApiResponse class của bạn
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
export interface BuildingDto {
  buildingId: string;
  name: string;
  buildingCode: string;
}
export interface UserAccountDto {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  roleName: string; // Backend trả về roleName đã được map
  status: string;
  staffCode?: string;
  createdAt?: string;
  isDeleted: boolean;

  // Resident specific
  apartmentCode?: string;

  // Staff specific - Mapped from Backend (List of Building Codes)
  assignedBuildingCodes: string[];
  assignedBuildingIds: string[];
}

export interface StaffCreateDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  staffCode?: string;
}

export interface StatusUpdateDto {
  status: string;
}

export interface AssignmentUpdateDto {
  buildingIds: string[];
  scopeOfWork?: string;
}

export interface RoleDto {
  roleId: string;
  roleName: string;
  isSystemDefined?: boolean;
  isActive?: boolean;
}

export interface UserQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: string;
  roleName?: string;
  sortColumn?: string;
  sortDirection?: string; // "asc" | "desc"
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/UserManagement`;
private buildingUrl = `${environment.apiUrl}/Buildings`;
  constructor(private http: HttpClient) { }

  // --- Helper to build HttpParams ---
  private buildParams(queryParams: UserQueryParams): HttpParams {
    let params = new HttpParams()
      .set('pageNumber', queryParams.pageNumber.toString())
      .set('pageSize', queryParams.pageSize.toString());

    if (queryParams.searchTerm) params = params.set('searchTerm', queryParams.searchTerm);
    if (queryParams.status) params = params.set('status', queryParams.status);
    if (queryParams.roleName) params = params.set('roleName', queryParams.roleName);
    if (queryParams.sortColumn) params = params.set('sortColumn', queryParams.sortColumn);
    if (queryParams.sortDirection) params = params.set('sortDirection', queryParams.sortDirection);

    return params;
  }

  // 1. GET Staffs
  getStaffAccounts(queryParams: UserQueryParams): Observable<ApiResponse<PagedList<UserAccountDto>>> {
    const params = this.buildParams(queryParams);
    return this.http.get<ApiResponse<PagedList<UserAccountDto>>>(`${this.apiUrl}/staffs`, { params });
  }

  // 2. GET Residents
  getResidentAccounts(queryParams: UserQueryParams): Observable<ApiResponse<PagedList<UserAccountDto>>> {
    const params = this.buildParams(queryParams);
    return this.http.get<ApiResponse<PagedList<UserAccountDto>>>(`${this.apiUrl}/residents`, { params });
  }

  // 3. CREATE Staff
  createStaffAccount(dto: StaffCreateDto): Observable<ApiResponse<UserAccountDto>> {
    return this.http.post<ApiResponse<UserAccountDto>>(`${this.apiUrl}/staffs`, dto);
  }

  // 4. TOGGLE Status
  toggleUserStatus(userId: string, status: string): Observable<ApiResponse<UserAccountDto>> {
    // Backend mong đợi body là { status: "Active" }
    const body: StatusUpdateDto = { status: status };
    return this.http.put<ApiResponse<UserAccountDto>>(`${this.apiUrl}/${userId}/status`, body);
  }

// [MỚI] 5. UPDATE Assignments
  updateStaffAssignments(staffId: string, buildingIds: string[], scopeOfWork?: string): Observable<ApiResponse<void>> {
    const body = { buildingIds, scopeOfWork };
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/staffs/${staffId}/assignments`, body);
  }

  // [MỚI] Helper lấy danh sách tất cả tòa nhà (để hiện checkbox)
  getAllBuildings(): Observable<ApiResponse<any>> { // ApiResponse<PagedList<BuildingDto>> hoặc List
    // Lưu ý: Backend BuildingController GetAll thường trả về PagedList. 
    // Ta lấy trang 1, size lớn để lấy hết hoặc cần endpoint get-all-lookup riêng.
    // Ở đây giả định lấy 100 tòa nhà đầu tiên.
    return this.http.get<ApiResponse<any>>(`${this.buildingUrl}?pageSize=100`);
  }

  // [MỚI] Reset Password (Admin reset cho User)
  // Backend cần endpoint: POST /api/Auth/reset-password-admin hoặc tương tự.
  // Nếu chưa có, ta giả định dùng endpoint UserManagement update profile hoặc logic riêng.
  // Ở đây tôi giả định bạn sẽ dùng logic Update thông thường hoặc 1 endpoint cụ thể.
  // Tạm thời gọi endpoint update profile hoặc endpoint giả định:
  resetPasswordByAdmin(userId: string): Observable<ApiResponse<any>> {
     // Logic này phụ thuộc Backend của bạn có endpoint "Force Reset" không.
     // Nếu không, ta gửi mật khẩu mới qua email.
     return this.http.post<ApiResponse<any>>(`${this.apiUrl}/staffs/${userId}/reset-password`, {});
  }
  // GET Roles (Helper for creating staff)
  getAllRoles(): Observable<ApiResponse<RoleDto[]>> {
    // Lưu ý: Endpoint này nằm ở Controller Roles, nên URL có thể khác
    // Nếu bạn gom vào UserManagementController thì dùng apiUrl, nếu không thì dùng endpoint riêng
    // Giả sử Controller Roles tách biệt: api/Roles
    return this.http.get<ApiResponse<RoleDto[]>>(`${this.apiUrl}/Roles`);
  }
}