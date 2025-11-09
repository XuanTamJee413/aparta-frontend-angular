// src/app/services/operation/utility.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // <-- THÊM HttpParams
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Import DTOs
import { UtilityDto, UtilityCreateDto, UtilityUpdateDto, PagedList, ServiceQueryParameters  } from '../../models/utility.model';



@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private apiUrl = `${environment.apiUrl}/Utility`; 

  constructor(private http: HttpClient) { }

  // --- CẬP NHẬT PHƯƠNG THỨC NÀY ---
  // GET: api/Utility (với phân trang và lọc)
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

  // GET: api/Utility/{id}
  getUtilityById(id: string): Observable<UtilityDto> {
    return this.http.get<UtilityDto>(`${this.apiUrl}/${id}`);
  }

  // POST: api/Utility
  addUtility(utility: UtilityCreateDto): Observable<UtilityDto> {
    return this.http.post<UtilityDto>(this.apiUrl, utility);
  }

  // PUT: api/Utility/{id}
  updateUtility(id: string, utility: UtilityUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, utility);
  }

  // DELETE: api/Utility/{id}
  deleteUtility(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}