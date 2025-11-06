import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}

export interface AssetQueryParameters {
  buildingId: string | null;
  searchTerm: string | null;
  sortBy: string | null;
  sortOrder: string | null;
}

export interface AssetDto {
  assetId: string;
  buildingId: string;
  info: string;
  quantity: number;
  createdAt: string | null;
  status: string;
}

export interface AssetCreateDto {
  buildingId: string;
  info: string;
  quantity: number;
}

export interface AssetUpdateDto {
  info?: string | null;
  quantity?: number | null;
}

export interface AssetView extends AssetDto {
  buildingName: string;
}

export interface BuildingDto {
  buildingId: string;
  buildingCode: string | null;
  name: string | null;
}

@Injectable({ providedIn: 'root' })
export class AssetManagementService {
  private assetApiUrl = 'http://localhost:5175/api/Assets';
  private buildingApiUrl = 'http://localhost:5175/api/Buildings';

  constructor(private http: HttpClient) {}

  private normalizeApiResponse<T>(res: any): ApiResponse<T> {
    const succeeded = res?.succeeded ?? res?.Succeeded ?? false;
    const message = res?.message ?? res?.Message ?? '';
    const data = (res?.data ?? res?.Data) as T;
    return { succeeded, message, data };
  }

  getAssets(query: AssetQueryParameters): Observable<ApiResponse<AssetDto[]>> {
    let params = new HttpParams();
    if (query.buildingId) params = params.set('buildingId', query.buildingId);
    if (query.searchTerm) params = params.set('searchTerm', query.searchTerm);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.http.get<any>(this.assetApiUrl, { params }).pipe(
      map(res => this.normalizeApiResponse<AssetDto[]>(res))
    );
  }

  getBuildings(): Observable<BuildingDto[]> {
    const params = new HttpParams().set('Skip', '0').set('Take', '1000');

    return this.http.get<any>(this.buildingApiUrl, { params }).pipe(
      map(res => {
        const data = res?.data ?? res?.Data ?? {};
        const items = (data?.items ?? data?.Items ?? []) as BuildingDto[];
        return items
          .map(b => ({
            ...b,
            buildingCode: b?.buildingCode ?? null,
            name: b?.name ?? null,
          }))
          .sort((a, b) => (a.buildingCode ?? '').localeCompare(b.buildingCode ?? ''));
      }),
      catchError(() => of<BuildingDto[]>([]))
    );
  }

  updateAsset(id: string, request: AssetUpdateDto): Observable<any> {
    return this.http.put(`${this.assetApiUrl}/${id}`, request);
  }

  createAsset(request: AssetCreateDto): Observable<any> {
    return this.http.post<AssetDto>(this.assetApiUrl, request);
  }

  deleteAsset(id: string): Observable<any> {
    return this.http.delete(`${this.assetApiUrl}/${id}`);
  }
}
