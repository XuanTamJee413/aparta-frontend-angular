import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceGroupDto, InvoiceDetailDto, ApiResponse } from '../../models/invoice-management.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceManagementService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách hóa đơn theo building
   * GET /api/buildings/{buildingId}/invoices
   */
  getInvoicesByBuilding(
    buildingId: string,
    status?: string,
    apartmentCode?: string
  ): Observable<ApiResponse<InvoiceGroupDto[]>> {
    let params = new HttpParams();
    if (status && status !== 'Tất cả') {
      params = params.set('status', status);
    }
    if (apartmentCode && apartmentCode.trim()) {
      params = params.set('apartmentCode', apartmentCode.trim());
    }

    return this.http.get<ApiResponse<InvoiceGroupDto[]>>(
      `${this.apiUrl}/buildings/${buildingId}/invoices`,
      { params }
    );
  }

  /**
   * Lấy chi tiết hóa đơn
   * GET /api/invoices/{invoiceId}
   */
  getInvoiceDetail(invoiceId: string): Observable<ApiResponse<InvoiceDetailDto>> {
    return this.http.get<ApiResponse<InvoiceDetailDto>>(
      `${this.apiUrl}/invoice/${invoiceId}`
    );
  }
}

