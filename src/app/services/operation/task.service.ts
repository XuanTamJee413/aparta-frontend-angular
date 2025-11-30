import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Import các DTO từ model
import { 
TaskDto, 
  TaskCreateDto, 
  TaskAssignmentCreateDto, 
  TaskQueryParameters, 
  PagedList, 
  StaffDto,
  TaskUnassignDto
} from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = `${environment.apiUrl}/tasks`;
  private usersApiUrl = `${environment.apiUrl}/User`; 

  constructor(private http: HttpClient) { }

  getTasks(params: TaskQueryParameters): Observable<PagedList<TaskDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.type) httpParams = httpParams.set('type', params.type);
    
    return this.http.get<PagedList<TaskDto>>(this.apiUrl, { params: httpParams });
  }

  createTask(task: TaskCreateDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.apiUrl, task);
  }

  assignTask(assignment: TaskAssignmentCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, assignment);
  }

  getMaintenanceStaffs(): Observable<StaffDto[]> {

    return this.http.get<StaffDto[]>(`${this.usersApiUrl}/maintenance-staff`);
  }

  // 2. DÀNH CHO MAINTENANCE STAFF (NHÂN VIÊN)
  // Lấy danh sách task CỦA TÔI
  getMyTasks(params: TaskQueryParameters): Observable<PagedList<TaskDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.status) httpParams = httpParams.set('status', params.status);
    
    // Gọi endpoint /api/tasks/my
    return this.http.get<PagedList<TaskDto>>(`${this.apiUrl}/my`, { params: httpParams });
  }

  // Cập nhật trạng thái (Bắt đầu / Hoàn thành)
  updateStatus(taskId: string, status: string, note: string | null): Observable<any> {
    const body = { status, note };
    // Gọi endpoint PUT /api/tasks/{id}/status
    return this.http.put(`${this.apiUrl}/${taskId}/status`, body);
  }

  unassignTask(unassignDto: TaskUnassignDto): Observable<any> {
    // Gọi endpoint POST /api/tasks/unassign
    return this.http.post(`${this.apiUrl}/unassign`, unassignDto);
  }
}