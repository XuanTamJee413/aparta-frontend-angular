import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface ApartmentMemberQueryParameters {
  isOwned: boolean | null;
  searchTerm: string | null;
  sortBy: string | null;
  sortOrder: string | null;
}

export interface ApartmentMember {
  apartmentMemberId: string;
  apartmentId: string;
  name: string;
  faceImageUrl: string | null;
  phoneNumber: string | null;
  info: string | null;
  idNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  isOwner: boolean;
  nationality: string | null;
  familyRole: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Apartment {
  apartmentId: string;
  code: string;
}

export interface ApartmentMemberUpdateDto {
  name?: string | null;
  phoneNumber?: string | null;
  idNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  status?: string | null;
  nationality?: string | null;
  familyRole?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ResidentManagementService {
  private apiUrl = 'http://localhost:5175/api/ApartmentMembers';
  private apartmentApiUrl = 'http://localhost:5175/api/Apartments';

  constructor(private http: HttpClient) {}

  getMemberById(id: string): Observable<ApartmentMember> {
    return this.http.get<ApartmentMember>(`${this.apiUrl}/${id}`);
  }

  getMembers(query: ApartmentMemberQueryParameters): Observable<ApiResponse<ApartmentMember[]>> {
    let params = new HttpParams();

    if (query.searchTerm) {
      params = params.append('SearchTerm', query.searchTerm);
    }
    if (query.isOwned !== null && query.isOwned !== undefined) {
      params = params.append('IsOwned', query.isOwned);
    }
    if (query.sortBy) {
      params = params.append('SortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.append('SortOrder', query.sortOrder);
    }

    return this.http.get<ApiResponse<ApartmentMember[]>>(this.apiUrl, { params });
  }

  getApartments(): Observable<ApiResponse<Apartment[]>> {
    return this.http.get<ApiResponse<Apartment[]>>(this.apartmentApiUrl);
  }

  getApartmentById(id: string): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.apartmentApiUrl}/${id}`);
  }

  updateMember(id: string, payload: ApartmentMemberUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }
}
