import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, switchMap } from 'rxjs';

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

  private extractSingle<T>(res: any): T | null {
    if (!res) return null;

    if (res.assetId || res.AssetId) {
      const obj: any = { ...res };
      if (obj.AssetId && !obj.assetId) obj.assetId = obj.AssetId;
      if (obj.BuildingId && !obj.buildingId) obj.buildingId = obj.BuildingId;
      if (obj.BuildingName && !obj.buildingName) obj.buildingName = obj.BuildingName;
      if (obj.CreatedAt && !obj.createdAt) obj.createdAt = obj.CreatedAt;
      return obj as T;
    }

    const data = res.data ?? res.Data ?? null;
    if (data) {
      if (data.assetId || data.AssetId) {
        const obj: any = { ...data };
        if (obj.AssetId && !obj.assetId) obj.assetId = obj.AssetId;
        if (obj.BuildingId && !obj.buildingId) obj.buildingId = obj.BuildingId;
        if (obj.BuildingName && !obj.buildingName) obj.buildingName = obj.BuildingName;
        if (obj.CreatedAt && !obj.createdAt) obj.createdAt = obj.CreatedAt;
        return obj as T;
      }
      return data as T;
    }

    return null;
  }

  getAssetById(id: string): Observable<AssetDto | AssetView | null> {
    return this.http.get<any>(`${this.assetApiUrl}/${id}`).pipe(
      map(res => this.extractSingle<AssetDto | AssetView>(res)),
      switchMap(parsed =>
        parsed !== null
          ? of(parsed)
          : this.http
              .get<any>(this.assetApiUrl, { params: new HttpParams().set('id', id) })
              .pipe(map(res2 => this.extractSingle<AssetDto | AssetView>(res2)))
      ),
      catchError(() =>
        this.http
          .get<any>(this.assetApiUrl, { params: new HttpParams().set('id', id) })
          .pipe(
            map(res2 => this.extractSingle<AssetDto | AssetView>(res2)),
            catchError(() => of(null))
          )
      )
    );
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
            buildingCode: b?.buildingCode ?? (b as any)?.BuildingCode ?? null,
            name: b?.name ?? (b as any)?.Name ?? null,
            buildingId: b?.buildingId ?? (b as any)?.BuildingId
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

  checkAssetExists(buildingId: string, info: string): Observable<boolean>;
  checkAssetExists(buildingId: string, info: string, excludeAssetId?: string): Observable<boolean>;

  checkAssetExists(buildingId: string, info: string, excludeAssetId?: string): Observable<boolean> {
    const norm = (s: string) => (s ?? '').toString().trim().replace(/\s+/g, ' ').toLowerCase();

    const params: AssetQueryParameters = {
      buildingId,
      searchTerm: info,
      sortBy: null,
      sortOrder: null
    };

    return this.getAssets(params).pipe(
      map(res => {
        const raw = res?.data as any;
        const list: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const targetInfo = norm(info);

        return list.some(a => {
          const id = a.assetId ?? a.AssetId ?? '';
          const sameBuilding = (a.buildingId ?? a.BuildingId) === buildingId;
          const sameInfo = norm(a.info ?? a.Info) === targetInfo;
          const notExcluded = !excludeAssetId || id !== excludeAssetId;
          return sameBuilding && sameInfo && notExcluded;
        });
      }),
      catchError(() => of(false))
    );
  }
}
