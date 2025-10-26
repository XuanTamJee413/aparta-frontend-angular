import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SubscriptionDto {
  subscriptionId: string;
  projectId: string;
  subscriptionCode: string;
  status: string; // "Draft", "Active", "Expired"
  amount: number;
  numMonths: number;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  amountPaid?: number;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentNote?: string;
}

export interface SubscriptionCreateOrUpdateDto {
  projectId: string;
  subscriptionCode: string;
  numMonths: number;
  amount: number;
  amountPaid?: number;
  paymentMethod?: string;
  paymentDate?: Date;
  paymentNote?: string;
  isApproved: boolean; // true = Approve, false = Save Draft
}

export interface SubscriptionQueryParameters {
  createdAtStart?: Date;
  createdAtEnd?: Date;
  status?: string; // "Draft", "Active", "Expired"
  skip?: number;
  take?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiUrl = `${environment.apiUrl}/Subscriptions`;

  constructor(private http: HttpClient) {}

  getAllSubscriptions(query?: SubscriptionQueryParameters): Observable<ApiResponse<PaginatedResult<SubscriptionDto>>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.createdAtStart) {
        params = params.set('createdAtStart', query.createdAtStart.toISOString());
      }
      if (query.createdAtEnd) {
        params = params.set('createdAtEnd', query.createdAtEnd.toISOString());
      }
      if (query.status) {
        params = params.set('status', query.status);
      }
      if (query.skip !== undefined) {
        params = params.set('skip', query.skip.toString());
      }
      if (query.take !== undefined) {
        params = params.set('take', query.take.toString());
      }
    }

    return this.http.get<ApiResponse<PaginatedResult<SubscriptionDto>>>(this.apiUrl, { params });
  }

  getSubscriptionById(id: string): Observable<ApiResponse<SubscriptionDto>> {
    return this.http.get<ApiResponse<SubscriptionDto>>(`${this.apiUrl}/${id}`);
  }

  createSubscription(subscription: SubscriptionCreateOrUpdateDto): Observable<ApiResponse<SubscriptionDto>> {
    return this.http.post<ApiResponse<SubscriptionDto>>(this.apiUrl, subscription);
  }

  updateSubscription(id: string, subscription: SubscriptionCreateOrUpdateDto): Observable<ApiResponse<SubscriptionDto>> {
    return this.http.put<ApiResponse<SubscriptionDto>>(`${this.apiUrl}/${id}`, subscription);
  }

  deleteSubscriptionDraft(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}

