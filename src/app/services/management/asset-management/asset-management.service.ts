import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset, AssetUpdateDto } from '../../../pages/building/management/asset-management/asset-list/asset-list.component';
import { AssetCreateDto } from '../../../pages/building/management/asset-management/create-asset/create-asset';


@Injectable({
  providedIn: 'root'
})
export class AssetManagementService {

  private apiUrl = 'http://localhost:5175/api/Assets';

  constructor(private http: HttpClient) { }


  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  updateAsset(id: string, request: AssetUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }
  createAsset(request: AssetCreateDto): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}
