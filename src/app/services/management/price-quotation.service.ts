import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface PriceQuotationDto {
  priceQuotationId: string;
  buildingId: string;
  buildingCode: string;
  feeType: string;
  calculationMethod: ECalculationMethod;
  unitPrice: number;
  unit: string | null;
  note: string | null;
  createdAt: string | null;
}

export interface PriceQuotationCreateDto {
  buildingId: string;
  feeType: string;
  calculationMethod: ECalculationMethod;
  unitPrice: number;
  unit: string | null;
  note: string | null;
}

export interface TieredPrice {
  fromValue: number;
  toValue: number | null;
  unitPrice: number;
}

export enum ECalculationMethod {
  FIXED = "FIXED",
  PER_UNIT_METER = "PER_UNIT_METER",
  PER_AREA = "PER_AREA",
  PER_PERSON = "PER_PERSON",
  PER_ITEM = "PER_ITEM",
  ONE_TIME = "ONE_TIME",
  TIERED = "TIERED", 
}

export interface BuildingDto {
  buildingId: string;
  buildingCode: string;
  name: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}

export interface PriceQuotationQueryParams {
  buildingId?: string | null;
  searchTerm?: string | null;
  sortColumn?: string | null;
  sortDirection?: string | null;
  pageNumber: number;
  pageSize: number;
}

export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CalculationMethodOption {
  value: ECalculationMethod;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class PriceQuotationService {

  private apiBaseUrl = environment.apiUrl;
  private quotationApiUrl = `${this.apiBaseUrl}/PriceQuotations`;
  
  private http = inject(HttpClient);

  getPriceQuotations(params: PriceQuotationQueryParams): Observable<PagedList<PriceQuotationDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());
    
    if (params.buildingId) {
      httpParams = httpParams.set('buildingId', params.buildingId);
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<ApiResponse<PagedList<PriceQuotationDto>>>(`${this.quotationApiUrl}/list`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getPriceQuotationById(id: string): Observable<PriceQuotationDto> {
    return this.http.get<ApiResponse<PriceQuotationDto>>(`${this.quotationApiUrl}/details/${id}`)
      .pipe(map(response => response.data));
  }

  getBuildings(): Observable<ApiResponse<BuildingDto[]>> {
  return this.http.get<ApiResponse<BuildingDto[]>>(`${environment.apiUrl}/UserManagement/managed-buildings`);
}

  createPriceQuotation(dto: PriceQuotationCreateDto): Observable<ApiResponse<PriceQuotationDto>> {
    return this.http.post<ApiResponse<PriceQuotationDto>>(`${this.quotationApiUrl}/create`, dto);
  }

  updatePriceQuotation(id: string, dto: PriceQuotationCreateDto): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.quotationApiUrl}/${id}`, dto);
  }

  deletePriceQuotation(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.quotationApiUrl}/${id}`);
  }

  getCalculationMethods(): Observable<CalculationMethodOption[]> {
    
    return this.http.get<ApiResponse<any[]>>(`${this.quotationApiUrl}/calculation-methods`)
      .pipe(
        map(response => {
          if (!response || !response.data) {
            return [];
          }
          return response.data.map(item => ({
            value: item.value, 
            name: item.name,
            description: item.description
          }));
        })
      );
  }
}