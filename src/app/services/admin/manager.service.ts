import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Manager } from '../../models/manager.model';

export interface ManagerResponse {
  data: Manager[] | Manager;
  succeeded: boolean;
  message: string;
}

// DTO để tạo mới Manager
export interface CreateManagerDto {
  name: string;
  phone: string;
  password: string;
  email: string;
  staffCode: string;
  avatarUrl?: string;
  buildingIds: string[];
}

// DTO để cập nhật Manager
export interface UpdateManagerDto {
  name: string;
  phone: string;
  email: string;
  password?: string;
  staffCode: string;
  avatarUrl?: string;
  status?: string;
  buildingIds: string[];
}

// Legacy interfaces for backward compatibility
export interface CreateManagerRequest extends CreateManagerDto {}
export interface UpdateManagerRequest extends UpdateManagerDto {}

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private apiUrl = `${environment.apiUrl}/Manager`;

  constructor(private http: HttpClient) { }

  getAllManagers(searchTerm?: string): Observable<ManagerResponse> {
    let url = this.apiUrl;
    if (searchTerm && searchTerm.trim()) {
      url += `?searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    return this.http.get<ManagerResponse>(url);
  }

  createManager(data: CreateManagerDto): Observable<ManagerResponse> {
    return this.http.post<ManagerResponse>(this.apiUrl, data);
  }

  updateManager(id: string, data: UpdateManagerDto): Observable<ManagerResponse> {
    return this.http.put<ManagerResponse>(`${this.apiUrl}/${id}`, data);
  }
}

