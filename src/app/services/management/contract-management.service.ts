import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Giao diện cho phản hồi API chung
 */
export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  messageCode: string;
  message: string;
  data: T;
}

/**
 * DTO hiển thị hợp đồng
 * Đã mở rộng theo API backend (apartmentCode, ownerName, ...)
 */
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
  sortBy?: string | null;    // 'startDate' | 'endDate'
  sortOrder?: string | null; // 'asc' | 'desc'
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

export interface ContractUpdateDto {
  startDate?: string;
  endDate?: string | null;
  image?: string | null;

  ownerName?: string;
  ownerEmail?: string;
  ownerPhoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractManagementService {

  private apiUrl = 'http://localhost:5175/api/Contracts';

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

  updateContract(id: string, dto: ContractUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  deleteContract(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
