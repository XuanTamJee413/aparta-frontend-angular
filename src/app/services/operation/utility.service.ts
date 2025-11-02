// src/app/services/operation/utility.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilityDto, UtilityCreateDto, UtilityUpdateDto } from '../../models/utility.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private apiUrl = `${environment.apiUrl}/Utility`; 

  constructor(private http: HttpClient) { }

  // GET: api/Utility
  getUtilities(): Observable<UtilityDto[]> {
    return this.http.get<UtilityDto[]>(this.apiUrl);
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