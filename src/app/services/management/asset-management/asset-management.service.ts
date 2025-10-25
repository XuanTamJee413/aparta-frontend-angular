import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../../../pages/building/management/asset-management/asset-list/asset-list.component';





@Injectable({
  providedIn: 'root'
})
export class AssetManagementService {



  private apiUrl = 'https://localhost:7272/api/Assets';

  constructor(private http: HttpClient) { }

  getAssets(): Observable<Asset[]> {

    return this.http.get<Asset[]>(this.apiUrl);
  }
}
