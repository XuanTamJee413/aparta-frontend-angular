import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserInfoResponse {
  userId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  apartmentId?: string | null;
  staffCode?: string | null;
  status: string;
  lastLoginAt?: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/User`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy thông tin user theo apartmentId
   * GET /api/User/by-apartment/{apartmentId}
   */
  getUserByApartment(apartmentId: string): Observable<UserInfoResponse> {
    return this.http.get<any>(`${this.apiUrl}/by-apartment/${apartmentId}`).pipe(
      map((user: any) => ({
        userId: user.userId || user.UserId || '',
        name: user.name || user.Name || '',
        phone: user.phone || user.Phone || '',
        email: user.email || user.Email || '',
        role: user.role || user.Role || '',
        apartmentId: user.apartmentId || user.ApartmentId || null,
        staffCode: user.staffCode || user.StaffCode || null,
        status: user.status || user.Status || '',
        lastLoginAt: user.lastLoginAt || user.LastLoginAt || null
      }))
    );
  }
}

