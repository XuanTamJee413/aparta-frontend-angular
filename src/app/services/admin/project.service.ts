import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ProjectDto, 
  ProjectCreateDto, 
  ProjectUpdateDto, 
  ProjectQueryParameters,
  ProjectListResponse,
  ProjectDetailResponse,
  ProjectBasicResponse
} from '../../models/project.model';

export * from '../../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/Projects`;

  constructor(private http: HttpClient) {}

  // API Mới
  getProjects(query: ProjectQueryParameters): Observable<ProjectListResponse> {
    let params = new HttpParams();
    if (query.isActive !== undefined && query.isActive !== null) {
      params = params.set('IsActive', query.isActive);
    }
    if (query.searchTerm) params = params.set('SearchTerm', query.searchTerm);
    if (query.sortBy) params = params.set('SortBy', query.sortBy);
    if (query.sortOrder) params = params.set('SortOrder', query.sortOrder);

    return this.http.get<ProjectListResponse>(this.apiUrl, { params });
  }

  // Hàm tương thích (Fix lỗi các module khác gọi getAllProjects)
  getAllProjects(query?: ProjectQueryParameters): Observable<ProjectListResponse> {
    return this.getProjects(query || {});
  }

  getProjectById(id: string): Observable<ProjectDetailResponse> {
    return this.http.get<ProjectDetailResponse>(`${this.apiUrl}/${id}`);
  }

  createProject(dto: ProjectCreateDto): Observable<ProjectDetailResponse> {
    return this.http.post<ProjectDetailResponse>(this.apiUrl, dto);
  }

  updateProject(id: string, dto: ProjectUpdateDto): Observable<ProjectBasicResponse> {
    return this.http.put<ProjectBasicResponse>(`${this.apiUrl}/${id}`, dto);
  }

  // Validate PayOS credentials
  validatePayOSCredentials(clientId: string, apiKey: string, checksumKey: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Payos/validate-credentials`, {
      clientId,
      apiKey,
      checksumKey
    });
  }
}