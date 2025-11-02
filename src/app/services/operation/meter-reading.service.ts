import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../src/environments/environment';
import { 
  MeterReading, 
  MeterReadingResponse, 
  MeterReadingProgressResponse,
  MeterReadingQueryParams
} from '../../models/meter-reading.model';

@Injectable({
  providedIn: 'root'
})
export class MeterReadingService {
  private apiUrl = `${environment.apiUrl}/MeterReadings`;

  constructor(private http: HttpClient) { }

  /**
   * Get recorded meter readings for a building and billing period
   */
  getRecordedReadings(params: MeterReadingQueryParams): Observable<MeterReadingResponse> {
    let httpParams = new HttpParams()
      .set('buildingCode', params.buildingCode)
      .set('billingPeriod', params.billingPeriod);

    if (params.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<MeterReadingResponse>(`${this.apiUrl}/recorded-readings`, { params: httpParams });
  }

  /**
   * Get meter reading progress for a building and billing period
   */
  getReadingProgress(buildingCode: string, billingPeriod: string): Observable<MeterReadingProgressResponse> {
    return this.http.get<MeterReadingProgressResponse>(
      `${this.apiUrl}/progress/${buildingCode}?billingPeriod=${billingPeriod}`
    );
  }

  /**
   * Generate invoices for a building
   */
  generateInvoices(buildingCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-invoices/${buildingCode}`, {});
  }
}
