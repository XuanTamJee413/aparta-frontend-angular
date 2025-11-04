import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Asset {
  assetId: string;
  buildingId: string;
  info: string;
  quantity: number;
}
export interface AssetUpdateDto {
  info?: string | null;
  quantity?: number | null;
}
export interface AssetCreateDto {
  buildingId: string;
  info: string;
  quantity: number;
}
export interface BuildingDto {
  buildingId: string;
  name: string;
}
export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
}
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}
export interface AssetView extends Asset {
  buildingName: string;
}

@Injectable({ providedIn: 'root' })
export class AssetManagementService {
  private assetApiUrl = 'http://localhost:5175/api/Assets';
  private buildingApiUrl = 'http://localhost:5175/api/Buildings';

  constructor(private http: HttpClient) {}

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.assetApiUrl);
  }

  updateAsset(id: string, request: AssetUpdateDto): Observable<any> {
    return this.http.put(`${this.assetApiUrl}/${id}`, request);
  }

  createAsset(request: AssetCreateDto): Observable<any> {
    return this.http.post(this.assetApiUrl, request);
  }

  deleteAsset(id: string): Observable<any> {
    return this.http.delete(`${this.assetApiUrl}/${id}`);
  }

  getBuildings(): Observable<BuildingDto[]> {
    const params = new HttpParams().set('PageNumber', '1').set('PageSize', '100');
    return this.http
      .get<ApiResponse<PaginatedResult<BuildingDto>>>(this.buildingApiUrl, { params })
      .pipe(map((response) => response.data.items));
  }
}
