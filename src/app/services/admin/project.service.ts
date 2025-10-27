import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProjectDto {
  projectId: string;
  projectCode?: string;
  name?: string;
  numApartments?: number;
  numBuildings?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export interface ProjectCreateDto {
  projectCode?: string;
  name?: string;
  numApartments?: number;
  numBuildings?: number;
}

export interface ProjectUpdateDto {
  projectCode?: string;
  name?: string;
  numApartments?: number;
  numBuildings?: number;
  isActive?: boolean;
}

export interface ProjectQueryParameters {
  isActive?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/Projects`;

  constructor(private http: HttpClient) {}

  getAllProjects(query?: ProjectQueryParameters): Observable<ApiResponse<ProjectDto[]>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.isActive !== undefined) {
        params = params.set('isActive', query.isActive.toString());
      }
      if (query.searchTerm) {
        params = params.set('searchTerm', query.searchTerm);
      }
      if (query.sortBy) {
        params = params.set('sortBy', query.sortBy);
      }
      if (query.sortOrder) {
        params = params.set('sortOrder', query.sortOrder);
      }
    }

    return this.http.get<ApiResponse<ProjectDto[]>>(this.apiUrl, { params });
  }

  getProjectById(id: string): Observable<ApiResponse<ProjectDto>> {
    return this.http.get<ApiResponse<ProjectDto>>(`${this.apiUrl}/${id}`);
  }

  createProject(project: ProjectCreateDto): Observable<ApiResponse<ProjectDto>> {
    return this.http.post<ApiResponse<ProjectDto>>(this.apiUrl, project);
  }

  updateProject(id: string, project: ProjectUpdateDto): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, project);
  }
}
