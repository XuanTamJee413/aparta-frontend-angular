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

export * from '../../models/building.model'; 

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = `${environment.apiUrl}/Buildings`;

  constructor(private http: HttpClient) {}

  // [CẬP NHẬT] Map đầy đủ tham số query
  getBuildings(query: BuildingQueryParameters): Observable<BuildingListResponse> {
    let params = new HttpParams();
    
    if (query.searchTerm) params = params.set('SearchTerm', query.searchTerm);
    if (query.projectId) params = params.set('ProjectId', query.projectId);
    if (query.isActive !== undefined && query.isActive !== null) params = params.set('IsActive', query.isActive);
    if (query.sortBy) params = params.set('SortBy', query.sortBy);
    if (query.sortOrder) params = params.set('SortOrder', query.sortOrder);
    
    if (query.skip !== undefined) params = params.set('Skip', query.skip.toString());
    if (query.take !== undefined) params = params.set('Take', query.take.toString());

    return this.http.get<BuildingListResponse>(this.apiUrl, { params });
  }

  // Hàm tương thích cũ
  getAllBuildings(params?: any): Observable<BuildingListResponse> {
    const query: BuildingQueryParameters = {
      searchTerm: params?.searchTerm,
      take: params?.take || 100,
      skip: params?.skip || 0
    };
    return this.getBuildings(query);
  }

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