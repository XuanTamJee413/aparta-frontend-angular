import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Import các DTO từ model
import { 
  TaskDto, 
  TaskCreateDto, 
  TaskAssignmentCreateDto, 
  TaskQueryParameters, // <-- Model mới bạn vừa tạo
  PagedList,           // <-- Model mới bạn vừa tạo
  StaffDto 
} from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = `${environment.apiUrl}/tasks`;
  // URL lấy danh sách user (để chọn maintenance staff)
  private usersApiUrl = `${environment.apiUrl}/User`; 

  constructor(private http: HttpClient) { }

  // 1. Lấy danh sách Task
  getTasks(params: TaskQueryParameters): Observable<PagedList<TaskDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.type) httpParams = httpParams.set('type', params.type);
    
    return this.http.get<PagedList<TaskDto>>(this.apiUrl, { params: httpParams });
  }

  // 2. Tạo Task mới (Hàm này đang bị thiếu gây lỗi)
  createTask(task: TaskCreateDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.apiUrl, task);
  }

  // 3. Phân công Task (Hàm này đang bị thiếu gây lỗi)
  assignTask(assignment: TaskAssignmentCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, assignment);
  }

  // 4. Lấy danh sách nhân viên bảo trì (Hàm này đang bị thiếu gây lỗi)
  getMaintenanceStaffs(): Observable<StaffDto[]> {
    // Giả định API lấy user theo role là: /api/users/maintenance-staff
    // Bạn hãy sửa lại đường dẫn này cho đúng với Backend thực tế của bạn
    return this.http.get<StaffDto[]>(`${this.usersApiUrl}/maintenance-staff`);
  }
}