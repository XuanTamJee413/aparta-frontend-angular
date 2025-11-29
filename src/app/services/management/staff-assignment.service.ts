import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { 
  ApiResponse, 
  PagedList,
  StaffAssignmentDto, 
  StaffAssignmentCreateDto, 
  StaffAssignmentUpdateDto, 
  StaffAssignmentQuery,
  StaffUserDto,
  BuildingAssignmentDto
} from '../../models/staff-assignment.model';

@Injectable({
  providedIn: 'root'
})
export class StaffAssignmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/staffassignments`;

  // Lấy danh sách phân công (kèm phân trang, filter, search)
  getAssignments(query: StaffAssignmentQuery): Observable<ApiResponse<PagedList<StaffAssignmentDto>>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.searchTerm) params = params.set('searchTerm', query.searchTerm);
    if (query.buildingId) params = params.set('buildingId', query.buildingId);
    if (query.userId) params = params.set('userId', query.userId);
    if (query.isActive !== undefined && query.isActive !== null) {
      params = params.set('isActive', query.isActive);
    }

    return this.http.get<ApiResponse<PagedList<StaffAssignmentDto>>>(this.apiUrl, { params });
  }

  // Lấy danh sách nhân viên khả dụng để gán (cho dropdown)
  getAvailableStaffs(searchTerm?: string): Observable<ApiResponse<StaffUserDto[]>> {
    let params = new HttpParams();
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    
    return this.http.get<ApiResponse<StaffUserDto[]>>(`${this.apiUrl}/available-staffs`, { params });
  }

  getAvailableBuildings(searchTerm?: string): Observable<ApiResponse<BuildingAssignmentDto[]>> {
    let params = new HttpParams();
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    
    return this.http.get<ApiResponse<BuildingAssignmentDto[]>>(`${this.apiUrl}/available-buildings`, { params });
  }

  assignStaff(data: StaffAssignmentCreateDto): Observable<ApiResponse<StaffAssignmentDto>> {
    return this.http.post<ApiResponse<StaffAssignmentDto>>(this.apiUrl, data);
  }

  updateAssignment(id: string, data: StaffAssignmentUpdateDto): Observable<ApiResponse<StaffAssignmentDto>> {
    return this.http.put<ApiResponse<StaffAssignmentDto>>(`${this.apiUrl}/${id}`, data);
  }

  deleteAssignment(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}