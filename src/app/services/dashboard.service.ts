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
  pendingMeterReadings: number;
  unpaidInvoices: number;
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

  getApartmentStatusByProject(): Observable<ApiResponse<ProjectApartmentStatus[]>> {
    return this.http.get<ApiResponse<ProjectApartmentStatus[]>>(`${this.apiUrl}/apartment-status-by-project`);
  }

  getAvailableYears(): Observable<ApiResponse<number[]>> {
    return this.http.get<ApiResponse<number[]>>(`${this.apiUrl}/available-years`);
  }

  getRevenueByProject(year: number): Observable<ApiResponse<ProjectRevenue[]>> {
    return this.http.get<ApiResponse<ProjectRevenue[]>>(`${this.apiUrl}/revenue-by-project?year=${year}`);
  }

  getRevenueByBuilding(year: number): Observable<ApiResponse<BuildingRevenue[]>> {
    return this.http.get<ApiResponse<BuildingRevenue[]>>(`${this.apiUrl}/revenue-by-building?year=${year}`);
  }

  getApartmentStatusByBuilding(): Observable<ApiResponse<BuildingApartmentStatus[]>> {
    return this.http.get<ApiResponse<BuildingApartmentStatus[]>>(`${this.apiUrl}/apartment-status-by-building`);
  }
}

export interface ProjectApartmentStatus {
  projectId: string;
  projectName: string;
  totalApartments: number;
  soldApartments: number;
  unsoldApartments: number;
}

export interface ProjectRevenue {
  projectId: string;
  projectName: string;
  revenueByMonth: MonthlyRevenue[];
  totalRevenue: number;
}

export interface BuildingApartmentStatus {
  buildingId: string;
  buildingName: string;
  totalApartments: number;
  soldApartments: number;
  unsoldApartments: number;
}

export interface BuildingRevenue {
  buildingId: string;
  buildingName: string;
  revenueByMonth: MonthlyRevenue[];
  totalRevenue: number;
}

