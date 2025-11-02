import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  MeterReadingDto,
  RecordMeterReadingRequest,
  MeterReadingQueryParams,
  ApartmentMeterInfo,
  RecordingProgressDto
} from '../../models/meter-reading.model';

export interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeterReadingService {
  private apiUrl = `${environment.apiUrl}/MeterReadings`;

  constructor(private http: HttpClient) { }

  /**
   * Get recording sheet for a building
   * GET /api/MeterReadings/recording-sheet?buildingCode=xxx
   */
  getRecordingSheet(buildingCode: string): Observable<ApiResponse<ApartmentMeterInfo[]>> {
    const params = new HttpParams().set('buildingCode', buildingCode);
    return this.http.get<ApiResponse<ApartmentMeterInfo[]>>(`${this.apiUrl}/recording-sheet`, { params });
  }

  /**
   * Record a meter reading
   * POST /api/MeterReadings/record
   */
  recordReading(request: RecordMeterReadingRequest): Observable<ApiResponse<MeterReadingDto>> {
    return this.http.post<ApiResponse<MeterReadingDto>>(`${this.apiUrl}/record`, request);
  }

  /**
   * Get meter reading progress for a building and billing period
   * GET /api/MeterReadings/progress/{buildingCode}?billingPeriod=xxx
   */
  getReadingProgress(buildingCode: string, billingPeriod: string): Observable<ApiResponse<RecordingProgressDto>> {
    const params = new HttpParams().set('billingPeriod', billingPeriod);
    return this.http.get<ApiResponse<RecordingProgressDto>>(
      `${this.apiUrl}/progress/${buildingCode}`,
      { params }
    );
  }

  /**
   * Generate invoices for a building
   * POST /api/MeterReadings/generate-invoices/{buildingCode}
   */
  generateInvoices(buildingCode: string): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/generate-invoices/${buildingCode}`, {});
  }

  /**
   * Get recorded meter readings for a building and billing period
   * GET /api/MeterReadings/recorded-readings?buildingCode=xxx&billingPeriod=xxx
   */
  getRecordedReadings(params: MeterReadingQueryParams): Observable<ApiResponse<MeterReadingDto[]>> {
    let httpParams = new HttpParams()
      .set('buildingCode', params.buildingCode)
      .set('billingPeriod', params.billingPeriod);

    if (params.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<ApiResponse<MeterReadingDto[]>>(`${this.apiUrl}/recorded-readings`, { params: httpParams });
  }

  /**
   * Get meter reading history for an apartment
   * GET /api/MeterReadings/history/{apartmentId}?meterId=xxx&limit=12
   */
  getReadingHistory(apartmentId: string, meterId: string, limit: number = 12): Observable<ApiResponse<MeterReadingDto[]>> {
    const params = new HttpParams()
      .set('meterId', meterId)
      .set('limit', limit.toString());
    return this.http.get<ApiResponse<MeterReadingDto[]>>(`${this.apiUrl}/history/${apartmentId}`, { params });
  }
}
