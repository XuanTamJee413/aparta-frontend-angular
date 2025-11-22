import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

export interface DashboardStatistics {
  totalBuildings: number;
  totalApartments: number;
  monthlyRevenue: number;
  occupancyRate: number;
  revenueByMonth: MonthlyRevenue[];
  apartmentStatus: ApartmentStatus;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ApartmentStatus {
  occupied: number;
  vacant: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getStatistics(): Observable<ApiResponse<DashboardStatistics>> {
    return this.http.get<ApiResponse<DashboardStatistics>>(`${this.apiUrl}/statistics`);
  }
}

