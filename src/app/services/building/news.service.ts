import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface News {
  newsId: string;
  title: string;
  content: string;
  authorUserId: string;
  authorName: string;
  status: string | null;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsResponse {
  data: News[] | News;
  succeeded: boolean;
  message: string;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
}

export interface UpdateNewsRequest {
  title: string;
  content: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/News`;

  constructor(private http: HttpClient) { }

  getAllNews(searchTerm?: string, status?: string): Observable<NewsResponse> {
    let url = this.apiUrl;
    const params: string[] = [];
    
    // Always include searchTerm parameter (can be empty string)
    const searchValue = searchTerm && searchTerm.trim() ? searchTerm.trim() : '';
    params.push(`searchTerm=${encodeURIComponent(searchValue)}`);
    
    // Only include status parameter if it's provided and not empty
    if (status !== undefined && status !== null && status !== '') {
      params.push(`status=${encodeURIComponent(status)}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<NewsResponse>(url);
  }

  createNews(data: CreateNewsRequest): Observable<NewsResponse> {
    return this.http.post<NewsResponse>(this.apiUrl, data);
  }

  getNewsById(id: string): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.apiUrl}/${id}`);
  }

  updateNews(id: string, data: UpdateNewsRequest): Observable<NewsResponse> {
    return this.http.put<NewsResponse>(`${this.apiUrl}/${id}`, data);
  }
}
