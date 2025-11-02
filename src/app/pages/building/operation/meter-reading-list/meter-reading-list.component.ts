import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { MeterReadingService } from '../../../../services/operation/meter-reading.service';
import { AuthService } from '../../../../services/auth.service';
import { 
  MeterReadingDto,
  MeterReadingQueryParams,
  RecordingProgressDto
} from '../../../../models/meter-reading.model';

interface GroupedReading {
  apartmentCode: string;
  waterReading?: MeterReadingDto;
  electricReading?: MeterReadingDto;
}

@Component({
  selector: 'app-meter-reading-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meter-reading-list.component.html',
  styleUrls: ['./meter-reading-list.component.css']
})
export class MeterReadingListComponent implements OnInit {
  Math = Math;
  meterReadings: MeterReadingDto[] = [];
  filteredReadings: MeterReadingDto[] = [];
  groupedReadings: GroupedReading[] = [];
  buildings: BuildingDto[] = [];
  loading = false;
  error = '';
  successMessage = '';
  generatingInvoices = false;
  progressData: RecordingProgressDto | null = null;
  
  // Filter properties
  selectedBuilding: string = '';
  selectedPeriod = this.getCurrentMonthPeriod();
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private buildingService: BuildingService,
    private meterReadingService: MeterReadingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.buildingService.getAllBuildings({ take: 100 }).subscribe({
      next: (res) => {
        this.buildings = Array.isArray(res.data?.items) ? res.data.items : [];
        if (this.buildings.length > 0) {
          this.selectedBuilding = this.buildings[0].buildingCode ?? '';
          this.loadMeterReadings();
          this.loadProgressData();
        }
      },
      error: (err) => {
        this.error = 'Không lấy được danh sách tòa nhà.';
      }
    });
  }

  loadProgressData(): void {
    if (!this.selectedBuilding || !this.selectedPeriod) return;

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      return;
    }

    this.meterReadingService.getReadingProgress(this.selectedBuilding, this.selectedPeriod)
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.progressData = response.data;
          }
        },
        error: (error) => {
          // Silent fail - progress is secondary feature
          if (error.status === 401 || error.status === 403) {
            // Token expired or no permission, but don't show error for secondary feature
            this.progressData = null;
          }
        }
      });
  }

  onBuildingChange(): void {
    this.currentPage = 1;
    this.loadMeterReadings();
    this.loadProgressData();
  }

  onPeriodChange(): void {
    this.currentPage = 1;
    this.loadMeterReadings();
    this.loadProgressData();
  }

  loadMeterReadings(): void {
    if (!this.selectedBuilding || !this.selectedPeriod) {
      return;
    }

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = '';
    
    const params: MeterReadingQueryParams = {
      buildingCode: this.selectedBuilding,
      billingPeriod: this.selectedPeriod,
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage
    };
    
    this.meterReadingService.getRecordedReadings(params).subscribe({
      next: (response) => {
        if (response.succeeded && Array.isArray(response.data)) {
          this.meterReadings = response.data;
          this.totalItems = response.data.length;
          this.filteredReadings = [...this.meterReadings];
          this.groupReadingsByApartment();
        } else {
          this.error = response.message || 'Không thể tải danh sách chỉ số.';
          this.meterReadings = [];
          this.filteredReadings = [];
          this.groupedReadings = [];
          this.totalItems = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 403) {
          this.error = 'Bạn không có quyền xem danh sách chỉ số. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 401) {
          this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          this.error = error.error?.message || error.message || 'Đã xảy ra lỗi khi tải danh sách chỉ số';
        }
        
        this.meterReadings = [];
        this.filteredReadings = [];
        this.groupedReadings = [];
        this.totalItems = 0;
      }
    });
  }

  getCurrentMonthPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  groupReadingsByApartment(): void {
    const grouped = new Map<string, GroupedReading>();

    this.filteredReadings.forEach(reading => {
      if (!grouped.has(reading.apartmentCode)) {
        grouped.set(reading.apartmentCode, {
          apartmentCode: reading.apartmentCode,
        });
      }

      const group = grouped.get(reading.apartmentCode)!;
      if (reading.meterType === 'WATER') {
        group.waterReading = reading;
      } else if (reading.meterType === 'ELECTRIC') {
        group.electricReading = reading;
      }
    });

    this.groupedReadings = Array.from(grouped.values());
    this.totalItems = this.groupedReadings.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedGroups(): GroupedReading[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.groupedReadings.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getTotalPages(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  getMeterTypeDisplay(type: string): string {
    return type === 'ELECTRIC' ? 'Điện' : 'Nước';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  generateInvoices(): void {
    if (!this.selectedBuilding) {
      this.error = 'Vui lòng chọn tòa nhà';
      return;
    }

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.generatingInvoices = true;
    this.error = '';
    this.successMessage = '';

    this.meterReadingService.generateInvoices(this.selectedBuilding).subscribe({
      next: (response) => {
        this.generatingInvoices = false;
        if (response.succeeded) {
          this.successMessage = response.message || `Đã tạo ${response.data || 0} hóa đơn thành công!`;
          // Reload data after generating invoices
          this.loadMeterReadings();
          this.loadProgressData();
          // Clear success message after 5 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        } else {
          this.error = response.message || 'Có lỗi xảy ra khi tạo hóa đơn';
        }
      },
      error: (error) => {
        this.generatingInvoices = false;
        
        if (error.status === 403) {
          this.error = 'Bạn không có quyền tạo hóa đơn. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 401) {
          this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          this.error = error.error?.message || error.message || 'Có lỗi xảy ra khi tạo hóa đơn';
        }
      }
    });
  }
}
