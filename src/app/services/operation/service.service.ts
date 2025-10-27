import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // 1. Import HttpParams
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// 2. Import các model mới
import { 
  ServiceDto, 
  ServiceCreateDto, 
  ServiceUpdateDto,
  ServiceQueryParameters,
  PagedList 
} from '../../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private apiUrl = `${environment.apiUrl}/Service`; 

  constructor(private http: HttpClient) { }

  // 3. THAY ĐỔI HOÀN TOÀN: getServices
  getServices(params: ServiceQueryParameters): Observable<PagedList<ServiceDto>> {
    
    // Xây dựng các tham số query
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    // Gửi request với các tham số
    return this.http.get<PagedList<ServiceDto>>(this.apiUrl, { params: httpParams });
  }

  // --- CÁC PHƯƠNG THỨC KHÁC GIỮ NGUYÊN ---

  // GET: api/Service/{id}
  getServiceById(id: string): Observable<ServiceDto> {
    return this.http.get<ServiceDto>(`${this.apiUrl}/${id}`);
  }

  // POST: api/Service
  addService(service: ServiceCreateDto): Observable<ServiceDto> {
    return this.http.post<ServiceDto>(this.apiUrl, service);
  }

  // PUT: api/Service/{id}
  updateService(id: string, service: ServiceUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, service);
  }

  // DELETE: api/Service/{id}
  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}