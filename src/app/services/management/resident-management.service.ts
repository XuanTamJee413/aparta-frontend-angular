
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApartmentMember } from '../../pages/building/operation/resident-list/resident-list';


@Injectable({
  providedIn: 'root'
})
export class ResidentManagementService {
  private apiUrl = 'https://localhost:7272/api/ApartmentMembers';

  constructor(private http: HttpClient) { }

  getMembers(): Observable<ApartmentMember[]> {

    return this.http.get<ApartmentMember[]>(this.apiUrl);
  }
}
