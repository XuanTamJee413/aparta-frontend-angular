import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// --- INTERFACES (DTOs) ---

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T;
}

export interface ApartmentMemberDto {
  apartmentMemberId: string;
  apartmentId: string | null;
  name: string | null;
  phoneNumber: string | null;
  idNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  isOwner: boolean;
  faceImageUrl?: string | null;
  info?: string | null;
  nationality?: string | null;
  updatedAt?: string | null;
  familyRole: string | null;
  createdAt?: string | null;
  status?: string | null;
}

export interface ApartmentMemberCreateDto {
  apartmentId: string;
  name: string;
  phoneNumber: string | null;
  idNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  isOwner: boolean | null;
  familyRole: string | null;
  nationality: string | null;

  faceImageUrl: string | null;
  info: string | null;
  status: string | null;
}

@Injectable({ providedIn: 'root' })
export class HouseholdService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5175/api/ApartmentMembers';

  getMyHousehold(): Observable<ApartmentMemberDto[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map((resp: any) => {
        if (Array.isArray(resp)) return resp as ApartmentMemberDto[];
        if (resp && Array.isArray(resp.data)) return resp.data as ApartmentMemberDto[];
        return [] as ApartmentMemberDto[];
      })
    );
  }

  addHouseholdMember(memberDto: ApartmentMemberCreateDto): Observable<ApartmentMemberDto> {
    return this.http.post<ApartmentMemberDto>(this.apiUrl, memberDto);
  }

  deleteHouseholdMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${memberId}`);
  }
}
