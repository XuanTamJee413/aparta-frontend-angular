import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, VehicleQueryParameters,ApiResponse, VehicleUpdateDto, Apartment } from '../../pages/building/operation/vehicle-management/vehicle-list/vehicle-list';

export interface VehicleCreateDto {
  apartmentId: string;
  vehicleNumber: string;
  info: string | null;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'http://localhost:5175/api/Vehicles';
  private apartmentApiUrl = 'http://localhost:5175/api/Apartments';
  constructor(private http: HttpClient) { }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  getVehicles(query: VehicleQueryParameters): Observable<ApiResponse<Vehicle[]>> {

    let params = new HttpParams();

    if (query.searchTerm) {
      params = params.append('SearchTerm', query.searchTerm);
    }
    if (query.status !== null && query.status !== undefined) {
      params = params.append('Status', query.status);
    }
    if (query.sortBy) {
      params = params.append('SortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.append('SortOrder', query.sortOrder);
    }

    return this.http.get<ApiResponse<Vehicle[]>>(this.apiUrl, { params });
  }


  updateVehicle(id: string, dto: VehicleUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }
  getApartments(): Observable<ApiResponse<Apartment[]>> {

    return this.http.get<ApiResponse<Apartment[]>>(this.apartmentApiUrl);
  }
  createVehicle(dto: VehicleCreateDto): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, dto);
  }
}
