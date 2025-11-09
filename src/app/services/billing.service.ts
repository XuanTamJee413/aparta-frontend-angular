import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GenerateInvoicesRequest, GenerateInvoicesResponse } from '../models/billing.model';
import { ApiResponse } from '../models/meter-reading.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Tạo hóa đơn cho một tòa nhà và kỳ thanh toán
   * POST /api/billing/generate-invoices
   */
  generateInvoices(requestBody: GenerateInvoicesRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/billing/generate-invoices`,
      requestBody
    );
  }
}

