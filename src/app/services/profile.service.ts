import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfileDto, ChangePasswordDto, UpdateProfileDto, ApiResponse } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<ApiResponse<UserProfileDto>> {
    return this.http.get<ApiResponse<UserProfileDto>>(this.apiUrl);
  }

  updateAvatar(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/avatar`, formData);
  }

  changePassword(dto: ChangePasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/change-password`, dto);
  }

  updateProfile(dto: UpdateProfileDto): Observable<ApiResponse<UserProfileDto>> {
    return this.http.put<ApiResponse<UserProfileDto>>(this.apiUrl, dto);
  }
}

