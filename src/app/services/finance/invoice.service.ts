import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceDto } from '../../models/invoice.model';

export interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/Invoice`;

  constructor(private http: HttpClient) { }

  /**
   * Get user's own invoices (for residents)
   * GET /api/Invoice/my-invoices
   */
  getMyInvoices(): Observable<ApiResponse<InvoiceDto[]>> {
    return this.http.get<ApiResponse<InvoiceDto[]>>(`${this.apiUrl}/my-invoices`);
  }

  /**
   * Get all invoices with query parameters (for staff)
   * GET /api/Invoice?status=xxx&apartmentCode=xxx
   */
  getInvoices(status?: string, apartmentCode?: string): Observable<ApiResponse<InvoiceDto[]>> {
    let httpParams = new HttpParams();

    if (status) {
      httpParams = httpParams.set('status', status);
    }
    if (apartmentCode) {
      httpParams = httpParams.set('apartmentCode', apartmentCode);
    }

    return this.http.get<ApiResponse<InvoiceDto[]>>(`${this.apiUrl}`, { params: httpParams });
  }

  /**
   * Create payment link for an invoice
   * POST /api/Invoice/{invoiceId}/pay
   */
  createPayment(invoiceId: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/${invoiceId}/pay`, {});
  }
}
