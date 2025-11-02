import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface ApartmentQueryParameters {
  searchTerm: string | null;
  sortBy: string | null;
  sortOrder: string | null;
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

export interface ApartmentUpdateDto {
  code?: string;
  area?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private apiUrl = 'http://localhost:5175/api/Apartments';

  constructor(private http: HttpClient) { }

  getApartments(query: ApartmentQueryParameters): Observable<ApiResponse<Apartment[]>> {
    let params = new HttpParams();
    if (query.searchTerm) {
      params = params.append('SearchTerm', query.searchTerm);
    }
    if (query.sortBy) {
      params = params.append('SortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.append('SortOrder', query.sortOrder);
    }
    return this.http.get<ApiResponse<Apartment[]>>(this.apiUrl, { params });
  }

  getApartmentById(id: string): Observable<Apartment> {
    return this.http.get<Apartment>(`${this.apiUrl}/${id}`);
  }

  updateApartment(id: string, dto: ApartmentUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }
}
