import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface VehicleQueryParameters {
  status: string | null;
  searchTerm: string | null;
  sortBy: string | null;
  sortOrder: string | null;
}

export interface Apartment {
  apartmentId: string;
  code: string;
}

export interface Vehicle {
  vehicleId: string;
  apartmentId: string;
  vehicleNumber: string;
  info: string | null;
  status: string;
  createdAt: string | null;
  apartmentCode?: string;
}

export interface VehicleUpdateDto {
  vehicleNumber?: string;
  info?: string;
  status?: string;
}

export interface VehicleCreateDto {
  apartmentId: string;
  vehicleNumber: string;
  info: string | null;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;
  private apartmentApiUrl = `${environment.apiUrl}/apartments`;

  constructor(private http: HttpClient) {}

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  getVehicles(query: VehicleQueryParameters): Observable<ApiResponse<Vehicle[]>> {
    let params = new HttpParams();
    if (query.searchTerm) params = params.append('SearchTerm', query.searchTerm);
    if (query.status !== null && query.status !== undefined) params = params.append('Status', query.status);
    if (query.sortBy) params = params.append('SortBy', query.sortBy);
    if (query.sortOrder) params = params.append('SortOrder', query.sortOrder);

    return this.http.get<ApiResponse<Vehicle[]>>(this.apiUrl, { params });
  }

  getMyVehicles(query: VehicleQueryParameters): Observable<ApiResponse<Vehicle[]>> {
    let params = new HttpParams();
    if (query.searchTerm) params = params.append('SearchTerm', query.searchTerm);
    if (query.status !== null && query.status !== undefined) params = params.append('Status', query.status);
    if (query.sortBy) params = params.append('SortBy', query.sortBy);
    if (query.sortOrder) params = params.append('SortOrder', query.sortOrder);

    return this.http.get<ApiResponse<Vehicle[]>>(`${this.apiUrl}/my-buildings`, { params });
  }

  updateVehicle(id: string, dto: VehicleUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  getApartments(): Observable<ApiResponse<Apartment[]>> {
    return this.http.get<ApiResponse<Apartment[]>>(this.apartmentApiUrl);
  }

  getMyApartments(): Observable<ApiResponse<Apartment[]>> {
    return this.http.get<ApiResponse<Apartment[]>>(`${this.apartmentApiUrl}/my-buildings`);
  }

  createVehicle(dto: VehicleCreateDto): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, dto);
  }
}
