import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApartmentMember,
  ApartmentMemberQueryParameters,
  ApiResponse
} from '../../pages/building/operation/resident-list/resident-list';


@Injectable({
  providedIn: 'root'
})
export class ResidentManagementService {
  private apiUrl = 'https://localhost:7272/api/ApartmentMembers';

  constructor(private http: HttpClient) { }


  getMembers(query: ApartmentMemberQueryParameters): Observable<ApiResponse<ApartmentMember[]>> {

    let params = new HttpParams();

    if (query.searchTerm) {
      params = params.append('SearchTerm', query.searchTerm);
    }
    if (query.isOwned !== null && query.isOwned !== undefined) {
      params = params.append('IsOwned', query.isOwned);
    }
    if (query.sortBy) {
      params = params.append('SortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.append('SortOrder', query.sortOrder);
    }

    return this.http.get<ApiResponse<ApartmentMember[]>>(this.apiUrl, { params });
  }
}

