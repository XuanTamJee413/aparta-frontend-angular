import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface Role {
  roleId: string;
  roleName: string;
  isSystemDefined: boolean;
  isActive: boolean;
}

export interface Permission {
  permissionId: string;
  name: string;
  groupName: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly baseUrl = `${environment.apiUrl}/Roles`;

  constructor(private readonly http: HttpClient) {}

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.baseUrl);
  }

  getRoleById(roleId: string): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/${roleId}`);
  }

  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.baseUrl}/permissions`);
  }

  getPermissionsForRole(roleId: string): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.baseUrl}/${roleId}/permissions`);
  }

  createRole(roleName: string): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.baseUrl, { roleName });
  }

  updateRole(roleId: string, roleName: string): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${roleId}`, { roleName });
  }

  deleteRole(roleId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${roleId}`);
  }

  assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${roleId}/permissions`, { permissionIds });
  }
}
