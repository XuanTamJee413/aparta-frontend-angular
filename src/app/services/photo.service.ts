import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PhotoUploadResponse {
  url: string;
  publicId: string;
}

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

interface CloudinaryUploadResultDto {
  publicId: string;
  secureUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly apiUrl = `${environment.apiUrl}/cloudinary/upload`;

  constructor(private http: HttpClient) {}

  uploadPhoto(file: File): Observable<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<CloudinaryUploadResultDto>>(this.apiUrl, formData)
      .pipe(
        map(response => ({
          url: response.data?.secureUrl ?? '',
          publicId: response.data?.publicId ?? ''
        }))
      );
  }
}


