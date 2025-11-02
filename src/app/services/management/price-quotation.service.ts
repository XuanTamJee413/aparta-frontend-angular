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
  PER_AREA = "PER_AREA",
  FIXED_PER_VEHICLE = "FIXED_PER_VEHICLE",
  PER_HOUR = "PER_HOUR",
  TIERED = "TIERED",
  FIXED_RATE = "FIXED_RATE",
  PER_PERSON_PER_MONTH = "PER_PERSON_PER_MONTH",
  PER_USE = "PER_USE",
  FIXED_ONE_TIME = "FIXED_ONE_TIME",
  FIXED_PER_PET_PER_MONTH = "FIXED_PER_PET_PER_MONTH",
  PER_SLOT = "PER_SLOT",
  FIXED_PER_MONTH = "FIXED_PER_MONTH",
  PER_KG = "PER_KG",
  PERCENT_PER_DAY_ON_DEBT = "PERCENT_PER_DAY_ON_DEBT"
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
  private buildingApiUrl = `${this.apiBaseUrl}/Buildings`;
  
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

  getBuildings(): Observable<BuildingDto[]> {
    const params = new HttpParams().set('Skip', '0').set('Take', '1000'); 
    
    return this.http.get<ApiResponse<PaginatedResult<BuildingDto>>>(`${this.buildingApiUrl}`, { params: params })
      .pipe(
        map(response => response.data.items.sort((a, b) => a.buildingCode.localeCompare(b.buildingCode)))
      );
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

  getCalculationMethods(): CalculationMethodOption[] {
    return [
      { value: ECalculationMethod.PER_AREA, name: "Tính theo diện tích (m2)", description: "Đơn giá * Diện tích căn hộ." },
      { value: ECalculationMethod.FIXED_RATE, name: "Tính đồng giá (Điện/Nước)", description: "ví dụ: nước nóng, gas,..  được cung cấp bởi tòa nhà, vẫn tính theo số như số điện nhưng không lũy tiến." },
      { value: ECalculationMethod.FIXED_PER_MONTH, name: "Cố định theo tháng", description: "Thu cố định mỗi căn hộ hàng tháng." },
      { value: ECalculationMethod.TIERED, name: "Tính lũy tiến (Bậc thang)", description: "Tính theo bậc, dùng cho Điện/Nước." },
      { value: ECalculationMethod.FIXED_PER_VEHICLE, name: "Cố định theo phương tiện", description: "Thu phí theo từng phương tiện." },
      { value: ECalculationMethod.PER_PERSON_PER_MONTH, name: "Tính theo người/tháng", description: "Đơn giá * Số người trong căn hộ." },
      { value: ECalculationMethod.PER_USE, name: "Tính theo lượt sử dụng", description: "Thu phí mỗi khi đăng ký." },
      { value: ECalculationMethod.PER_SLOT, name: "Tính theo gói (ví dụ: BBQ)", description: "Thu phí theo khung giờ đăng ký." },
      { value: ECalculationMethod.PERCENT_PER_DAY_ON_DEBT, name: "Phạt % quá hạn", description: "Đơn giá là % (ví dụ: 0.05 = 5%)." },
    ];
  }
}