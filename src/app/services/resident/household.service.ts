import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';

export interface ApiResponse<T> { succeeded: boolean; message: string | null; data: T; }
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

  getMembersByApartment(apartmentId: string): Observable<ApartmentMemberDto[]> {
    const params = new HttpParams().set('apartmentId', apartmentId);
    return this.http.get<unknown>(this.apiUrl, { params }).pipe(
      map((resp: any) => {
        const arr: ApartmentMemberDto[] =
          Array.isArray(resp) ? resp :
          (resp && Array.isArray(resp.data) ? resp.data :
          (resp && Array.isArray(resp?.Data) ? resp.Data :
          (resp?.data?.items ?? resp?.Data?.Items ?? [])));
        return arr.filter(m => String(m.apartmentId ?? '') === String(apartmentId));
      })
    );
  }

  addHouseholdMember(memberDto: ApartmentMemberCreateDto): Observable<ApartmentMemberDto> {
    return this.http.post<ApartmentMemberDto>(this.apiUrl, memberDto);
  }

  deleteHouseholdMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${memberId}`);
  }

  checkIdNumberExists(idNumber: string): Observable<boolean> {
    const norm = (s: string) => (s ?? '').toString().trim();
    const q = norm(idNumber);
    const params = new HttpParams().set('searchTerm', q);

    return this.http.get<unknown>(this.apiUrl, { params }).pipe(
      map((resp: any) => {
        const list: any[] =
          Array.isArray(resp) ? resp :
          (Array.isArray(resp?.data) ? resp.data :
          (Array.isArray(resp?.Data) ? resp.Data :
          (resp?.data?.items ?? resp?.Data?.Items ?? [])));
        return list.some(x => norm(x?.idNumber ?? x?.IdNumber ?? '') === q);
      }),
      catchError(() => of(false))
    );
  }
}
