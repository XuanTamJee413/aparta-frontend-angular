import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Manager {
  userId: string;
  name: string;
  email: string;
  staffCode: string;
  avatarUrl: string | null;
  phone: string;
  role: string | null;
  status: string;
  lastLoginAt: string | null;
  permissionGroup: string | null;
}

export interface ManagerResponse {
  data: Manager[] | Manager;
  succeeded: boolean;
  message: string;
}

export interface CreateManagerRequest {
  name: string;
  phone: string;
  password: string;
  email: string;
  staffCode: string;
  avatarUrl?: string;
}

export interface UpdateManagerRequest {
  name: string;
  phone: string;
  email: string;
  password?: string;
  staffCode: string;
  avatarUrl?: string;
}

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

  createManager(data: CreateManagerRequest): Observable<ManagerResponse> {
    return this.http.post<ManagerResponse>(this.apiUrl, data);
  }

  updateManager(id: string, data: UpdateManagerRequest): Observable<ManagerResponse> {
    return this.http.put<ManagerResponse>(`${this.apiUrl}/${id}`, data);
  }
}

