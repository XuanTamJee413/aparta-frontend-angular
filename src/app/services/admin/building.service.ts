import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BuildingDto {
  buildingId: string;
  projectId: string;
  buildingCode?: string;
  name?: string;
  numResidents?: number;
  numApartments?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export interface BuildingCreateDto {
  projectId: string;
  buildingCode: string;
  name: string;
  numApartments?: number;
  numResidents?: number;
}

export interface BuildingUpdateDto {
  name?: string;
  numApartments?: number;
  numResidents?: number;
  isActive?: boolean;
}

export interface BuildingQueryParameters {
  searchTerm?: string;
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
export class BuildingService {
  private readonly apiUrl = `${environment.apiUrl}/Buildings`;

  constructor(private http: HttpClient) {}

  getAllBuildings(query?: BuildingQueryParameters): Observable<ApiResponse<PaginatedResult<BuildingDto>>> {
    let params = new HttpParams();
    
    if (query) {
      if (query.searchTerm) {
        params = params.set('searchTerm', query.searchTerm);
      }
      if (query.skip !== undefined) {
        params = params.set('skip', query.skip.toString());
      }
      if (query.take !== undefined) {
        params = params.set('take', query.take.toString());
      }
    }

    return this.http.get<ApiResponse<PaginatedResult<BuildingDto>>>(this.apiUrl, { params });
  }

  getBuildingById(id: string): Observable<ApiResponse<BuildingDto>> {
    return this.http.get<ApiResponse<BuildingDto>>(`${this.apiUrl}/${id}`);
  }

  createBuilding(building: BuildingCreateDto): Observable<ApiResponse<BuildingDto>> {
    return this.http.post<ApiResponse<BuildingDto>>(this.apiUrl, building);
  }

  updateBuilding(id: string, building: BuildingUpdateDto): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, building);
  }

  // Soft delete - deactivate building
  deleteBuilding(id: string): Observable<ApiResponse<any>> {
    return this.updateBuilding(id, { isActive: false });
  }
}
