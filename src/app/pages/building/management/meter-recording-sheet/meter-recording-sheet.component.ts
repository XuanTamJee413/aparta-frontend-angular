import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { MeterReadingService } from '../../../../services/operation/meter-reading.service';
import { AuthService } from '../../../../services/auth.service';
import { Meter, ApartmentMeterInfo } from '../../../../models/meter-reading.model';

@Component({
  selector: 'app-meter-recording-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meter-recording-sheet.component.html',
  styleUrls: ['./meter-recording-sheet.component.css']
})
export class MeterRecordingSheetComponent implements OnInit {
  apartments: ApartmentMeterInfo[] = [];
  apartmentsCurrentPage: ApartmentMeterInfo[] = [];
  page = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  meterTypes: string[] = [];
  loading = false;
  error = '';
  buildingCode = '';
  buildings: BuildingDto[] = [];
  sheetHasBeenLoaded = false;

  constructor(
    private buildingService: BuildingService,
    private meterReadingService: MeterReadingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getBuildingsList();
  }

  getBuildingsList(): void {
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

  isRented(apartment: ApartmentMeterInfo): boolean {
    return (
      !apartment.status ||
      ['Đang thuê', 'Đã thuê', 'Rented', 'Occupied'].includes((apartment.status || '').trim())
    );
  }

  fetchRecordingSheet(): void {
    if (!this.buildingCode) return;

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.sheetHasBeenLoaded = true;
    this.loading = true;
    this.error = '';
    this.apartments = [];
    this.apartmentsCurrentPage = [];
    this.meterTypes = [];
    this.totalItems = 0;
    this.page = 1;
    this.totalPages = 0;

    this.meterReadingService.getRecordingSheet(this.buildingCode).subscribe({
      next: (response) => {
        if (response.succeeded && Array.isArray(response.data)) {
          this.apartments = response.data;
          this.totalItems = this.apartments.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.setPage(1);
          const found = this.apartments.find(ap => this.isRented(ap));
          this.meterTypes = found ? found.meters.map(m => m.meterType) : [];
        } else {
          this.error = response.message || 'Không lấy được dữ liệu bảng nhập.';
          this.apartments = [];
          this.apartmentsCurrentPage = [];
          this.meterTypes = [];
          this.totalItems = 0;
          this.page = 1;
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 403) {
          this.error = 'Bạn không có quyền xem bảng nhập chỉ số. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 401) {
          this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          this.error = error.error?.message || error.message || 'Lỗi khi gọi API.';
        }
        
        this.apartments = [];
        this.apartmentsCurrentPage = [];
        this.meterTypes = [];
        this.totalItems = 0;
        this.page = 1;
        this.totalPages = 0;
      }
    });
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.apartmentsCurrentPage = this.apartments.slice(start, end);
  }

  prevPage(): void {
    if (this.page > 1) this.setPage(this.page - 1);
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.setPage(this.page + 1);
  }

  validateCurrentReading(meter: Meter): void {
    const last = Number(meter.lastReading);
    const current = Number(meter.currentReading);
    if (meter.currentReading == null || isNaN(current)) {
      meter.inputError = false;
    } else {
      meter.inputError = current < last;
    }
  }

  saveReading(apartment: ApartmentMeterInfo, meter: Meter): void {
    this.validateCurrentReading(meter);
    meter.saveError = '';
    meter.saveSuccess = false;
    
    if (meter.inputError || meter.currentReading == null || isNaN(Number(meter.currentReading))) {
      meter.saveError = 'Vui lòng nhập hợp lệ!';
      return;
    }

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      meter.saveError = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    meter.saving = true;
    const payload = {
      apartmentId: apartment.apartmentId,
      meterId: meter.meterId,
      currentReading: Number(meter.currentReading)
    };

    this.meterReadingService.recordReading(payload).subscribe({
      next: (response) => {
        meter.saving = false;
        if (response.succeeded && response.data) {
          meter.saveSuccess = true;
          meter.isRecorded = true;
          meter.currentReading = response.data.currentReading;
          meter.recordedByName = response.data.recordedByName || 'Bạn';
          meter.readingDate = response.data.recordedAt || response.data.readingDate;
          meter.consumption = response.data.consumption;
          meter.estimatedCost = response.data.estimatedCost;
          meter.saveError = '';
        } else {
          meter.saveError = response.message || 'Lỗi lưu chỉ số.';
        }
      },
      error: (error) => {
        meter.saving = false;
        
        if (error.status === 403) {
          meter.saveError = 'Bạn không có quyền ghi chỉ số. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 401) {
          meter.saveError = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          meter.saveError = error.error?.message || error.message || 'Lỗi lưu chỉ số.';
        }
      }
    });
  }
}
