import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  messageCode: string;
  message: string;
  data: T;
}

export interface ContractDto {
  contractId: string;
  apartmentId: string;
  apartmentCode?: string | null;
  ownerName?: string | null;
  ownerPhoneNumber?: string | null;
  ownerEmail?: string | null;
  startDate: string | null;
  endDate: string | null;
  image?: string | null;
  createdAt?: string | null;
}

export interface ContractQueryParameters {
  apartmentId?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
}

export interface ContractCreateDto {
  apartmentId: string;
  startDate: string;
  endDate: string | null;
  image?: string | null;

  ownerName: string;
  ownerEmail: string;
  ownerPhoneNumber: string;
  ownerIdNumber: string;
  ownerGender: string;
  ownerDateOfBirth: string;
  ownerNationality: string;
}

export interface AvailableApartmentDto {
  apartmentId: string;
  code: string;
}

export interface ContractUpdateDto {
  startDate?: string;
  endDate?: string | null;
  image?: string | null;

  ownerName?: string;
  ownerEmail?: string;
  ownerPhoneNumber?: string;
}

interface ApartmentListItemFromApi {
  apartmentId: string;
  buildingId: string;
  code: string;
  type?: string | null;
  status: string;
  area?: number | null;
  createdAt?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ContractManagementService {

  private apiUrl = `${environment.apiUrl}/Contracts`;
  private apartmentApiUrl = `${environment.apiUrl}/Apartments`;

  constructor(private http: HttpClient) { }

  getContracts(query: ContractQueryParameters | null): Observable<ApiResponse<ContractDto[]>> {
    let params = new HttpParams();

    if (query) {
      if (query.apartmentId) {
        params = params.set('apartmentId', query.apartmentId);
      }
      if (query.sortBy) {
        params = params.set('sortBy', query.sortBy);
      }
      if (query.sortOrder) {
        params = params.set('sortOrder', query.sortOrder);
      }
    }

    return this.http.get<ApiResponse<ContractDto[]>>(this.apiUrl, { params });
  }

  getContractById(id: string): Observable<ContractDto> {
    return this.http.get<ContractDto>(`${this.apiUrl}/${id}`);
  }

  createContract(dto: ContractCreateDto): Observable<ContractDto> {
    return this.http.post<ContractDto>(this.apiUrl, dto);
  }

  getAvailableApartments(): Observable<ApiResponse<AvailableApartmentDto[]>> {
    const params = new HttpParams()
      .set('status', 'Còn Trống')
      .set('sortBy', 'code')
      .set('sortOrder', 'asc');

    return this.http
      .get<ApiResponse<ApartmentListItemFromApi[]>>(this.apartmentApiUrl, { params })
      .pipe(
        map(res => ({
          statusCode: res.statusCode,
          succeeded: res.succeeded,
          messageCode: res.messageCode,
          message: res.message,
          data: (res.data || []).map(a => ({
            apartmentId: a.apartmentId,
            code: a.code
          }))
        }))
      );
  }

  updateContract(id: string, dto: ContractUpdateDto, file?: File): Observable<void> {
    const formData = new FormData();

    if (dto.endDate !== undefined && dto.endDate !== null) {
      formData.append('EndDate', dto.endDate);
    }

    if (file) {
      formData.append('ImageFile', file);
    } else {
      if (dto.image !== undefined && dto.image !== null) {
        formData.append('Image', dto.image);
      }
    }

    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getContractPdfUrl(id: string): string {
    return `${this.apiUrl}/${id}/pdf`;
  }
}
