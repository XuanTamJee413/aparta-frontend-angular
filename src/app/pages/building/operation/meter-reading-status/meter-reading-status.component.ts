import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Inject, Optional } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { MeterReadingService } from '../../../../services/operation/meter-reading.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { MeterReadingStatusDto } from '../../../../models/meter-reading.model';
import { BillingService } from '../../../../services/billing.service';
import { AuthService } from '../../../../services/auth.service';
import { finalize } from 'rxjs/operators';

// Custom date formats for month/year picker
export const MONTH_YEAR_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Custom DateAdapter để chỉ cho phép chọn tháng/năm
export class MonthYearDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: object): string {
    const formatStr = (displayFormat as any)?.dateInput || (displayFormat as any);
    if (formatStr === MONTH_YEAR_FORMATS.display.dateInput || formatStr === 'MM/YYYY') {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${String(month).padStart(2, '0')}/${year}`;
    }
    return super.format(date, displayFormat);
  }

  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const str = value.split('/');
      const month = parseInt(str[0], 10);
      const year = parseInt(str[1], 10);
      return new Date(year, month - 1, 1);
    }
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }
}

@Component({
  selector: 'app-meter-reading-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatTableModule
  ],
  providers: [
    { provide: DateAdapter, useClass: MonthYearDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_YEAR_FORMATS }
  ],
  templateUrl: './meter-reading-status.component.html',
  styleUrls: ['./meter-reading-status.component.css']
})
export class MeterReadingStatusComponent implements OnInit {
  buildings: BuildingDto[] = [];
  filteredBuildings: BuildingDto[] = [];
  buildingSearchText: string = '';
  selectedBuildingId: string = '';
  billingPeriodDate: Date | null = null;
  billingPeriod: string = '';
  statusList: MeterReadingStatusDto[] = [];
  groupedReadings: Map<string, MeterReadingStatusDto[]> = new Map();
  apartmentIds: string[] = [];
  filteredApartmentIds: string[] = [];
  displayedColumns: string[] = ['apartmentCode', 'feeType', 'readingValue', 'status', 'readingDate', 'recordedByName'];
  
  // Search
  apartmentSearchText: string = '';
  statusFilter: string = ''; // Filter theo trạng thái
  
  // Pagination
  pageSize = 20;
  pageIndex = 0;
  totalApartments = 0;
  
  loadingBuildings = false;
  loadingStatus = false;
  hasData = false;
  isGenerating = false;

  constructor(
    public authService: AuthService,
    private meterReadingService: MeterReadingService,
    private buildingService: BuildingService,
    private billingService: BillingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.billingPeriodDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.billingPeriod = this.getCurrentBillingPeriod();
    this.loadBuildings();
  }

  // Lấy billing period hiện tại (yyyy-MM)
  getCurrentBillingPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Chuyển đổi Date sang billing period (yyyy-MM)
  dateToBillingPeriod(date: Date | null): string {
    if (!date) return this.getCurrentBillingPeriod();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Xử lý khi chọn date (chỉ month/year)
  onDateChange(date: Date | null): void {
    if (date) {
      // Set ngày về 1 để chỉ quan tâm tháng/năm
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), 1);
      this.billingPeriodDate = normalizedDate;
      this.billingPeriod = this.dateToBillingPeriod(normalizedDate);
      if (this.selectedBuildingId) {
        this.loadStatus();
      }
    }
  }

  // Xử lý khi chọn tháng trong datepicker
  onMonthSelected(event: Date, datepicker: any): void {
    const normalizedDate = new Date(event.getFullYear(), event.getMonth(), 1);
    this.billingPeriodDate = normalizedDate;
    this.billingPeriod = this.dateToBillingPeriod(normalizedDate);
    datepicker.close();
    if (this.selectedBuildingId) {
      this.loadStatus();
    }
  }

  // Lọc danh sách tòa nhà
  filterBuildings(): void {
    if (!this.buildingSearchText.trim()) {
      this.filteredBuildings = [...this.buildings];
    } else {
      const searchLower = this.buildingSearchText.toLowerCase().trim();
      this.filteredBuildings = this.buildings.filter(b =>
        (b.name?.toLowerCase().includes(searchLower) ||
         b.buildingCode?.toLowerCase().includes(searchLower))
      );
    }
  }

  // Xử lý khi thay đổi search text
  onBuildingSearchChange(): void {
    this.filterBuildings();
  }

  // Tải danh sách tòa nhà
  loadBuildings(): void {
    this.loadingBuildings = true;
    this.buildingService.getAllBuildings({ take: 100 }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.items) {
          this.buildings = response.data.items.filter(b => b.isActive);
          this.filteredBuildings = [...this.buildings];
          // Auto-select building đầu tiên
          if (this.buildings.length > 0 && !this.selectedBuildingId) {
            this.selectedBuildingId = this.buildings[0].buildingId;
            // Tự động load status nếu đã có billing period
            if (this.billingPeriod) {
              this.loadStatus();
            }
          }
        }
        this.loadingBuildings = false;
      },
      error: (error) => {
        this.showError('Không thể tải danh sách tòa nhà');
        this.loadingBuildings = false;
      }
    });
  }

  // Xử lý khi chọn building
  onBuildingChange(): void {
    if (this.selectedBuildingId && this.billingPeriod) {
      this.loadStatus();
    }
  }

  // Group readings theo apartment
  groupReadingsByApartment(): void {
    this.groupedReadings.clear();
    this.statusList.forEach(reading => {
      const apartmentId = reading.apartmentId;
      if (!this.groupedReadings.has(apartmentId)) {
        this.groupedReadings.set(apartmentId, []);
      }
      this.groupedReadings.get(apartmentId)!.push(reading);
    });
  }

  // Lấy danh sách apartment codes (sorted)
  getApartmentIds(): string[] {
    return this.apartmentIds;
  }

  // Lọc apartments theo search text và status
  filterApartments(): void {
    let filtered = [...this.apartmentIds];
    
    // Filter theo apartment code
    if (this.apartmentSearchText.trim()) {
      const searchLower = this.apartmentSearchText.toLowerCase().trim();
      filtered = filtered.filter(apartmentId => {
        const apartmentCode = this.getApartmentCode(apartmentId);
        return apartmentCode.toLowerCase().includes(searchLower);
      });
    }
    
    // Filter theo status
    if (this.statusFilter) {
      filtered = filtered.filter(apartmentId => {
        const readings = this.groupedReadings.get(apartmentId) || [];
        return readings.some(reading => reading.status === this.statusFilter);
      });
    }
    
    this.filteredApartmentIds = filtered;
    this.totalApartments = this.filteredApartmentIds.length;
    this.pageIndex = 0;
  }
  
  // Xử lý khi thay đổi status filter
  onStatusFilterChange(): void {
    this.filterApartments();
  }

  // Xử lý khi thay đổi search text
  onApartmentSearchChange(): void {
    this.filterApartments();
  }

  // Lấy danh sách apartment codes cho trang hiện tại
  getPaginatedApartmentIds(): string[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredApartmentIds.slice(startIndex, endIndex);
  }

  // Xử lý khi thay đổi trang
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Lấy danh sách readings dạng flat list (cho table) - group theo apartment và filter theo status
  getFlatReadingsList(): MeterReadingStatusDto[] {
    const flatList: MeterReadingStatusDto[] = [];
    this.getPaginatedApartmentIds().forEach(apartmentId => {
      let readings = this.groupedReadings.get(apartmentId) || [];
      // Filter theo status nếu có
      if (this.statusFilter) {
        readings = readings.filter(reading => reading.status === this.statusFilter);
      }
      flatList.push(...readings);
    });
    return flatList;
  }
  
  // Lấy danh sách các status options
  getStatusOptions(): string[] {
    return ['Chưa ghi', 'Đã ghi - Đã khóa', 'Đã ghi - Mở'];
  }

  // Kiểm tra xem đây có phải là apartment đầu tiên trong group không
  isFirstReadingInApartment(reading: MeterReadingStatusDto, index: number): boolean {
    const flatList = this.getFlatReadingsList();
    if (index === 0) return true;
    const previousReading = flatList[index - 1];
    return previousReading.apartmentId !== reading.apartmentId;
  }

  // Lấy apartment code từ apartmentId
  getApartmentCode(apartmentId: string): string {
    const readings = this.groupedReadings.get(apartmentId);
    return readings && readings.length > 0 ? readings[0].apartmentCode : '';
  }

  // Lấy tên hoặc mã tòa nhà đã chọn
  getSelectedBuildingName(): string {
    if (!this.selectedBuildingId) {
      return 'Chọn tòa nhà';
    }
    const building = this.buildings.find(b => b.buildingId === this.selectedBuildingId);
    return building ? (building.name || building.buildingCode || '') : 'Chọn tòa nhà';
  }

  // Tải báo cáo tình trạng
  loadStatus(): void {
    if (!this.selectedBuildingId || !this.billingPeriod) {
      return;
    }

    this.loadingStatus = true;
    this.hasData = false;
    this.statusList = [];
    this.groupedReadings.clear();

    this.meterReadingService.getMeterReadingStatusByBuilding(
      this.selectedBuildingId,
      this.billingPeriod
    ).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.statusList = response.data;
          this.hasData = this.statusList.length > 0;
          if (this.hasData) {
            this.groupReadingsByApartment();
            this.apartmentIds = Array.from(this.groupedReadings.keys()).sort();
            this.statusFilter = ''; // Reset status filter khi load dữ liệu mới
            this.filterApartments();
          }
        } else {
          this.showError(response.message || 'Không thể tải báo cáo');
        }
        this.loadingStatus = false;
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.error?.Message || 'Không thể tải báo cáo';
        this.showError(errorMessage);
        this.loadingStatus = false;
      }
    });
  }

  // Lấy class CSS cho trạng thái
  getStatusClass(status: string): string {
    if (status === 'Chưa ghi') {
      return 'status-not-recorded';
    } else if (status === 'Đã ghi - Đã khóa') {
      return 'status-locked';
    } else if (status === 'Đã ghi - Mở') {
      return 'status-open';
    }
    return '';
  }

  // Format ngày hiển thị
  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return date;
    }
  }

  // Hiển thị thông báo lỗi
  showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Hiển thị thông báo thành công
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Chạy billing job để chốt sổ và tạo hóa đơn
  runBillingJob(): void {
    if (!this.selectedBuildingId) {
      this.showError('Vui lòng chọn Tòa nhà');
      return;
    }

    this.isGenerating = true;
    const requestBody = {
      buildingId: this.selectedBuildingId,
      billingPeriod: this.billingPeriod || undefined
    };

    this.billingService.generateInvoices(requestBody)
      .pipe(
        finalize(() => {
          this.isGenerating = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            const message = response.message || 'Đã xử lý thành công';
            this.showSuccess(message);
            // Refresh dữ liệu để cập nhật trạng thái "Đã khóa"
            this.loadStatus();
          } else {
            this.showError(response.message || 'Không thể tạo hóa đơn');
          }
        },
        error: (error) => {
          const errorMessage = error.error?.message || error.error?.Message || 'Không thể tạo hóa đơn';
          this.showError(errorMessage);
        }
      });
  }
}

