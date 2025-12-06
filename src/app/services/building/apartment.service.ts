// src/app/services/building/apartment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface ApartmentQueryParameters {
  searchTerm: string | null;
  sortBy: string | null;
  sortOrder: string | null;
  status: string | null;
  buildingId: string | null;
}

export interface Apartment {
  apartmentId: string;
  buildingId: string;
  code: string;
  type: string;
  status: string;
  area: number;
  createdAt: string;
}

export interface ApartmentCreateDto {
  buildingId: string;
  code: string;
  type: string;
  area: number;
  status: string;
  floor: number;
}

export interface ApartmentUpdateDto {
  code?: string;
  type?: string;
  status?: string;
  area?: number;
}

export interface BuildingOption {
  buildingId: string;
  name: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
}

export interface ApartmentBulkRoomConfig {
  roomIndex: number;
  type: string;
  area: number;
}

export interface ApartmentBulkCreateDto {
  buildingId: string;
  startFloor: number;
  endFloor: number;
  rooms: ApartmentBulkRoomConfig[];
}

@Injectable({ providedIn: 'root' })
export class ApartmentService {
  private apiUrl = `${environment.apiUrl}/Apartments`;
  private buildingApiUrl = `${environment.apiUrl}/Buildings`;

  constructor(private http: HttpClient) { }

  getApartments(query: ApartmentQueryParameters): Observable<ApiResponse<Apartment[]>> {
    let params = new HttpParams();
    if (query.searchTerm) params = params.append('SearchTerm', query.searchTerm);
    if (query.status) params = params.append('Status', query.status);
    if (query.buildingId) params = params.append('BuildingId', query.buildingId);
    if (query.sortBy) params = params.append('SortBy', query.sortBy);
    if (query.sortOrder) params = params.append('SortOrder', query.sortOrder);

    return this.http.get<ApiResponse<Apartment[]>>(this.apiUrl, { params });
  }

  // NEW: scoped apartments for buildings current account manages
  getMyApartments(query: ApartmentQueryParameters): Observable<ApiResponse<Apartment[]>> {
    let params = new HttpParams();
    if (query.searchTerm) params = params.append('SearchTerm', query.searchTerm);
    if (query.status) params = params.append('Status', query.status);
    if (query.buildingId) params = params.append('BuildingId', query.buildingId);
    if (query.sortBy) params = params.append('SortBy', query.sortBy);
    if (query.sortOrder) params = params.append('SortOrder', query.sortOrder);

    return this.http.get<ApiResponse<Apartment[]>>(`${this.apiUrl}/my-buildings`, { params });
  }

  getApartmentById(id: string): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.apiUrl}/${id}`);
  }

  createApartment(dto: ApartmentCreateDto): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  updateApartment(id: string, dto: ApartmentUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  generateApartments(dto: ApartmentBulkCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, dto);
  }

  getBuildings(): Observable<BuildingOption[]> {
    const params = new HttpParams().set('PageNumber', '1').set('PageSize', '100');
    return this.http
      .get<ApiResponse<PaginatedResult<BuildingOption>>>(this.buildingApiUrl, { params })
      .pipe(map(res => res.data.items));
  }

  // NEW: buildings scoped to current account
  getMyBuildings(): Observable<BuildingOption[]> {
    const params = new HttpParams().set('PageNumber', '1').set('PageSize', '100');
    return this.http
      .get<ApiResponse<PaginatedResult<BuildingOption>>>(`${this.buildingApiUrl}/my-buildings`, { params })
      .pipe(map(res => res.data.items));
  }

  isCodeUniqueInBuilding(
    buildingId: string,
    code: string,
    excludeApartmentId?: string
  ): Observable<boolean> {
    const trimmed = code.trim();
    const params = {
      searchTerm: trimmed,
      sortBy: null,
      sortOrder: null,
      status: null,
      buildingId: buildingId
    } as ApartmentQueryParameters;

    // NOTE: use getMyApartments? keep using getApartments so validator checks across all apartments
    // but you can switch to getMyApartments if you want uniqueness check only within managed buildings
    return this.getApartments(params).pipe(
      map(res => {
        const list = res.data || [];
        const lower = trimmed.toLowerCase();
        const exists = list.some(a =>
          a.buildingId === buildingId &&
          a.code?.trim().toLowerCase() === lower &&
          a.apartmentId !== (excludeApartmentId ?? '')
        );
        return !exists;
      })
    );
  }
}
