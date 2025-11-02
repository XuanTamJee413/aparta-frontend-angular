import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { Meter, Apartment } from '../../../../models/meter-reading.model';

@Component({
  selector: 'app-meter-recording-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meter-recording-sheet.component.html',
  styleUrls: ['./meter-recording-sheet.component.css']
})
export class MeterRecordingSheetComponent implements OnInit {
  apartments: Apartment[] = [];
  apartmentsCurrentPage: Apartment[] = [];
  page = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  meterTypes: string[] = [];
  loading = false;
  error = '';
  buildingCode = '';
  readonly staffId = '0c6e83d4e11849b7a6c014556a0d3da6';
  buildings: BuildingDto[] = [];
  sheetHasBeenLoaded = false;

  constructor(private http: HttpClient, private buildingService: BuildingService) {}

  ngOnInit(): void { this.getBuildingsList(); }

  getBuildingsList() {
    this.buildingService.getAllBuildings({ take: 100 }).subscribe({
      next: (res) => {
        this.buildings = Array.isArray(res.data?.items) ? res.data.items : [];
      },
      error: (err) => {
        this.error = 'Không lấy được danh sách tòa nhà.';
        this.buildings = [];
      }
    });
  }

  isRented(apartment: Apartment): boolean {
    return (
      !apartment.status ||
      ['Đang thuê', 'Đã thuê', 'Rented', 'Occupied'].includes((apartment.status || '').trim())
    );
  }

  fetchRecordingSheet() {
    if (!this.buildingCode) return;
    this.sheetHasBeenLoaded = true;
    this.loading = true;
    this.error = '';
    this.apartments = [];
    this.apartmentsCurrentPage = [];
    this.meterTypes = [];
    this.totalItems = 0;
    this.page = 1;
    this.totalPages = 0;
    this.http.get<any>(`/api/MeterReadings/recording-sheet?buildingCode=${this.buildingCode}`)
      .subscribe({
        next: (res) => {
          if (res.succeeded && Array.isArray(res.data)) {
            this.apartments = res.data;
            this.totalItems = this.apartments.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            this.setPage(1);
            const found = this.apartments.find(ap => this.isRented(ap));
            this.meterTypes = found ? found.meters.map((m: any) => m.meterType) : [];
          } else {
            this.error = res.message || 'Không lấy được dữ liệu bảng nhập.';
            this.apartments = [];
            this.apartmentsCurrentPage = [];
            this.meterTypes = [];
            this.totalItems = 0;
            this.page = 1;
            this.totalPages = 0;
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Lỗi khi gọi API.';
          this.apartments = [];
          this.apartmentsCurrentPage = [];
          this.meterTypes = [];
          this.totalItems = 0;
          this.page = 1;
          this.totalPages = 0;
        }
      });
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.apartmentsCurrentPage = this.apartments.slice(start, end);
  }

  prevPage() { if (this.page > 1) this.setPage(this.page - 1); }
  nextPage() { if (this.page < this.totalPages) this.setPage(this.page + 1); }

  validateCurrentReading(meter: Meter) {
    const last = Number(meter.lastReading);
    const current = Number(meter.currentReading);
    if (meter.currentReading == null || isNaN(current)) {
      meter.inputError = false;
    } else {
      meter.inputError = current < last;
    }
  }

  saveReading(apartment: Apartment, meter: Meter) {
    this.validateCurrentReading(meter);
    meter.saveError = '';
    meter.saveSuccess = false;
    if (meter.inputError || meter.currentReading == null || isNaN(Number(meter.currentReading))) {
      meter.saveError = 'Vui lòng nhập hợp lệ!';
      return;
    }
    meter.saving = true;
    const payload = {
      apartmentId: apartment.apartmentId,
      meterId: meter.meterId,
      currentReading: Number(meter.currentReading)
    };
    this.http.post<any>(`http://localhost:5175/api/MeterReadings/record?staffId=${this.staffId}`, payload)
      .subscribe({
        next: (res) => {
          meter.saving = false;
          if (res.succeeded) {
            meter.saveSuccess = true;
            meter.isRecorded = true;
            meter.currentReading = res.data.currentReading;
            meter.recordedByName = res.data.recordedByName || 'Bạn';
            meter.readingDate = res.data.readingDate;
            meter.consumption = res.data.consumption;
            meter.estimatedCost = res.data.estimatedCost;
            meter.saveError = '';
          } else {
            meter.saveError = res.message || 'Lỗi lưu chỉ số.';
          }
        },
        error: (err) => {
          meter.saving = false;
          meter.saveError = err.error?.message || 'Lỗi lưu chỉ số.';
        }
      })
  }
}
