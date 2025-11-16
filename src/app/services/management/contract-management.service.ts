import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

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

  private apiUrl = 'http://localhost:5175/api/Contracts';
  private apartmentApiUrl = 'http://localhost:5175/api/Apartments';

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

  getContractById(id: string): Observable<ApiResponse<ContractDto>> {
    return this.http.get<ApiResponse<ContractDto>>(`${this.apiUrl}/${id}`);
  }


  createContract(dto: ContractCreateDto): Observable<ContractDto | ApiResponse<ContractDto>> {
    return this.http.post<ContractDto | ApiResponse<ContractDto>>(this.apiUrl, dto);
  }


  getAvailableApartments(): Observable<ApiResponse<AvailableApartmentDto[]>> {
    const params = new HttpParams()
      .set('status', 'Chưa Thuê')
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

  updateContract(id: string, dto: ContractUpdateDto): Observable<ApiResponse<ContractDto>> {
    return this.http.put<ApiResponse<ContractDto>>(`${this.apiUrl}/${id}`, dto);
  }

  deleteContract(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
