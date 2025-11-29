import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  BuildingDto, 
  BuildingCreateDto, 
  BuildingUpdateDto, 
  BuildingQueryParameters,
  BuildingListResponse,
  BuildingDetailResponse,
  BuildingBasicResponse 
} from '../../models/building.model';

// --- QUAN TRỌNG: Re-export để các file cũ không bị lỗi import ---
export * from '../../models/building.model'; 

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = `${environment.apiUrl}/Buildings`;

  constructor(private http: HttpClient) {}

  // API mới chuẩn
  getBuildings(query: BuildingQueryParameters): Observable<BuildingListResponse> {
    let params = new HttpParams();
    
    if (query.searchTerm) params = params.set('SearchTerm', query.searchTerm);
    if (query.skip !== undefined) params = params.set('Skip', query.skip.toString());
    if (query.take !== undefined) params = params.set('Take', query.take.toString());

    return this.http.get<BuildingListResponse>(this.apiUrl, { params });
  }

  // --- HÀM TƯƠNG THÍCH (FIX LỖI CÁC MODULE KHÁC) ---
  // Các module khác đang gọi getAllBuildings({ take: 100 })
  getAllBuildings(params?: any): Observable<BuildingListResponse> {
    const query: BuildingQueryParameters = {
      searchTerm: params?.searchTerm,
      take: params?.take || 100,
      skip: params?.skip || 0
    };
    return this.getBuildings(query);
  }
  // -------------------------------------------------

  getBuildingById(id: string): Observable<BuildingDetailResponse> {
    return this.http.get<BuildingDetailResponse>(`${this.apiUrl}/${id}`);
  }

  createBuilding(dto: BuildingCreateDto): Observable<BuildingDetailResponse> {
    return this.http.post<BuildingDetailResponse>(this.apiUrl, dto);
  }

  updateBuilding(id: string, dto: BuildingUpdateDto): Observable<BuildingBasicResponse> {
    return this.http.put<BuildingBasicResponse>(`${this.apiUrl}/${id}`, dto);
  }
}