// src/app/services/operation/meter-reading.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApartmentDto,
  MeterReadingServiceDto,
  MeterReadingCreateDto,
  MeterReadingUpdateDto,
  ApiResponse,
  MeterReadingDto,
  MeterReadingCheckResponse
} from '../../models/meter-reading.model';

@Injectable({
  providedIn: 'root'
})
export class MeterReadingService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách căn hộ có status = "Đã thuê" thuộc building có is_active = true và project có is_active = true
   */
  getApartmentsForBuilding(buildingId: string): Observable<ApiResponse<ApartmentDto[]>> {
    return this.http.get<ApiResponse<ApartmentDto[]>>(
      `${this.apiUrl}/Buildings/${buildingId}/rented-apartments`
    );
  }

  /**
   * Lấy danh sách các loại phí (fee_type) cần trả hằng tháng cho một căn hộ
   */
  getServicesForApartment(apartmentId: string): Observable<ApiResponse<MeterReadingServiceDto>> {
    return this.http.get<ApiResponse<MeterReadingServiceDto>>(
      `${this.apiUrl}/MeterReadings/services-for-apartment/${apartmentId}`
    );
  }

  /**
   * Thêm các chỉ số mới cho một căn hộ
   */
  createMeterReadings(
    apartmentId: string,
    readings: MeterReadingCreateDto[]
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/MeterReadings/for-apartment/${apartmentId}`,
      readings
    );
  }

  /**
   * Kiểm tra xem có meterReading trong tháng này chưa
   * GET /api/MeterReadings/check/{apartmentId}/{feeType}/{billingPeriod}
   */
  checkMeterReadingExists(
    apartmentId: string,
    feeType: string,
    billingPeriod: string
  ): Observable<ApiResponse<MeterReadingCheckResponse>> {
    return this.http.get<ApiResponse<MeterReadingCheckResponse>>(
      `${this.apiUrl}/MeterReadings/check/${apartmentId}/${encodeURIComponent(feeType)}/${billingPeriod}`
    );
  }

  /**
   * PUT /api/MeterReadings/{readingId}
   * Sửa một chỉ số đã ghi (chỉ khi chưa bị khóa - invoice_item_id = null)
   */
  updateMeterReading(
    readingId: string,
    dto: MeterReadingUpdateDto
  ): Observable<ApiResponse<MeterReadingDto>> {
    return this.http.put<ApiResponse<MeterReadingDto>>(
      `${this.apiUrl}/MeterReadings/${readingId}`,
      dto
    );
  }

}

