import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Import DTOs (nhớ update import BuildingSimpleDto)
import { UtilityDto, UtilityCreateDto, UtilityUpdateDto, PagedList, ServiceQueryParameters, BuildingSimpleDto } from '../../models/utility.model';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private apiUrl = `${environment.apiUrl}/Utility`;
  // Giả sử API lấy tòa nhà nằm ở đây
  private staffApiUrl = `${environment.apiUrl}/StaffAssignments`;

  constructor(private http: HttpClient) { }

  // --- CẬP NHẬT PHƯƠNG THỨC NÀY ---
  getUtilities(params: ServiceQueryParameters): Observable<PagedList<UtilityDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PagedList<UtilityDto>>(this.apiUrl, { params: httpParams });
  }

  getUtilityById(id: string): Observable<UtilityDto> {
    return this.http.get<UtilityDto>(`${this.apiUrl}/${id}`);
  }

  addUtility(utility: UtilityCreateDto): Observable<UtilityDto> {
    return this.http.post<UtilityDto>(this.apiUrl, utility);
  }

  updateUtility(id: string, utility: UtilityUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, utility);
  }

  deleteUtility(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- THÊM MỚI: Lấy danh sách tòa nhà Staff quản lý ---
  // Bạn cần đảm bảo Backend có API trả về danh sách tòa nhà rút gọn cho Staff
 getMyBuildings(): Observable<any> { 
    return this.http.get<any>(`${this.staffApiUrl}/my-buildings`).pipe(
    );
  }

  getUtilitiesForResident(params: ServiceQueryParameters): Observable<PagedList<UtilityDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    // Cư dân mặc định chỉ xem Available nên có thể hardcode hoặc truyền từ component

    return this.http.get<PagedList<UtilityDto>>(`${this.apiUrl}/resident`, { params: httpParams });
  }
}