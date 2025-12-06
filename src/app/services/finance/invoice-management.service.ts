import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceGroupDto, InvoiceDetailDto, InvoiceDto, ApiResponse } from '../../models/invoice-management.model';

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
    apartmentCode?: string,
    feeType?: string
  ): Observable<ApiResponse<InvoiceGroupDto[]>> {
    let params = new HttpParams();
    if (status && status !== 'Tất cả') {
      params = params.set('status', status);
    }
    if (apartmentCode && apartmentCode.trim()) {
      params = params.set('apartmentCode', apartmentCode.trim());
    }
    if (feeType) {
      params = params.set('feeType', feeType);
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

  /**
   * Tạo hóa đơn một lần
   * POST /api/invoices/one-time
   */
  createOneTimeInvoice(formData: FormData): Observable<ApiResponse<InvoiceDto>> {
    return this.http.post<ApiResponse<InvoiceDto>>(
      `${this.apiUrl}/Invoice/one-time`,
      formData
    );
  }

  /**
   * Đánh dấu hóa đơn đã thanh toán
   * PUT /api/invoices/{id}/mark-paid
   */
  markInvoiceAsPaid(invoiceId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/Invoice/${invoiceId}/mark-paid`,
      {}
    );
  }

  /**
   * Xóa hóa đơn
   * DELETE /api/invoices/{id}
   */
  deleteInvoice(invoiceId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/Invoice/${invoiceId}`
    );
  }

  /**
   * Cập nhật ngày kết thúc thanh toán cho hóa đơn quá hạn
   * PUT /api/invoice/{id}/update-end-date
   */
  updateInvoiceEndDate(invoiceId: string, endDate: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/Invoice/${invoiceId}/update-end-date`,
      { endDate }
    );
  }
}

