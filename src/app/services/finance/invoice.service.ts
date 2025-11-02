import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InvoiceDto,
  PagedList,
  InvoiceQueryParameters,
  InvoiceResponse
} from '../../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/Invoice`; // Try uppercase first
  
  // Fallback URL in case API uses lowercase
  private getApiUrl(): string {
    return this.apiUrl;
  }

  constructor(private http: HttpClient) { }

  /**
   * Get all invoices with query parameters
   */
  getInvoices(params: InvoiceQueryParameters): Observable<InvoiceResponse> {
    let httpParams = new HttpParams();

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.month) {
      httpParams = httpParams.set('month', params.month);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    const url = `${this.apiUrl}`;
    console.log('Invoice API URL:', url);
    console.log('Invoice API Params:', httpParams.toString());
    console.log('Full URL:', `${url}?${httpParams.toString()}`);

    return this.http.get<InvoiceResponse>(url, { params: httpParams });
  }

  /**
   * Get pending invoices (convenience endpoint)
   */
  getPendingInvoices(params: Omit<InvoiceQueryParameters, 'status'>): Observable<InvoiceResponse> {
    let httpParams = new HttpParams();

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.month) {
      httpParams = httpParams.set('month', params.month);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.pageNumber) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<InvoiceResponse>(`${this.apiUrl}/pending`, { params: httpParams });
  }
}

