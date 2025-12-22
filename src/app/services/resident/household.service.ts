import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/ApartmentMembers`;

  getMembersByApartment(apartmentId: string, status?: string): Observable<ApartmentMemberDto[]> {
    let params = new HttpParams().set('apartmentId', apartmentId);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<ApartmentMemberDto[]>>(this.apiUrl, { params }).pipe(
      map((resp: ApiResponse<ApartmentMemberDto[]>) => {
        if (resp && resp.succeeded && resp.data && Array.isArray(resp.data)) {
          const normalizedMembers: ApartmentMemberDto[] = resp.data.map((m: any) => ({
            apartmentMemberId: m.apartmentMemberId || m.ApartmentMemberId || '',
            apartmentId: m.apartmentId || m.ApartmentId || null,
            name: m.name || m.Name || null,
            phoneNumber: m.phoneNumber || m.PhoneNumber || null,
            idNumber: m.idNumber || m.IdNumber || null,
            gender: m.gender || m.Gender || null,
            dateOfBirth: m.dateOfBirth || m.DateOfBirth || null,
            isOwner: m.isOwner !== undefined ? m.isOwner : (m.IsOwner !== undefined ? m.IsOwner : false),
            faceImageUrl: m.faceImageUrl || m.FaceImageUrl || null,
            info: m.info || m.Info || null,
            nationality: m.nationality || m.Nationality || null,
            updatedAt: m.updatedAt || m.UpdatedAt || null,
            familyRole: m.familyRole || m.FamilyRole || null,
            createdAt: m.createdAt || m.CreatedAt || null,
            status: m.status || m.Status || null
          }));
          return normalizedMembers.filter(m => String(m.apartmentId ?? '') === String(apartmentId));
        }
        return [];
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  addHouseholdMember(memberDto: ApartmentMemberCreateDto, faceImageFile?: File | null): Observable<ApartmentMemberDto> {
  const formData = new FormData();

  formData.append('apartmentId', memberDto.apartmentId);
  formData.append('name', memberDto.name);
  if (memberDto.familyRole != null) formData.append('familyRole', memberDto.familyRole);
  if (memberDto.dateOfBirth != null) formData.append('dateOfBirth', memberDto.dateOfBirth);
  if (memberDto.gender != null) formData.append('gender', memberDto.gender);
  if (memberDto.idNumber != null) formData.append('idNumber', memberDto.idNumber);
  if (memberDto.phoneNumber != null) formData.append('phoneNumber', memberDto.phoneNumber);
  if (memberDto.nationality != null) formData.append('nationality', memberDto.nationality);
  if (memberDto.status != null) formData.append('status', memberDto.status);
  if (memberDto.info != null) formData.append('info', memberDto.info);
  if (memberDto.faceImageUrl != null) formData.append('faceImageUrl', memberDto.faceImageUrl);

  formData.append('isOwner', String(memberDto.isOwner ?? false));

  if (faceImageFile) {
    formData.append('faceImageFile', faceImageFile);
  }

  return this.http.post<ApartmentMemberDto>(this.apiUrl, formData);
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
