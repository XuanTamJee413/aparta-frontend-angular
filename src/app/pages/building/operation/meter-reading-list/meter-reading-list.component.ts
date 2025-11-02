import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { MeterReadingService } from '../../../../services/operation/meter-reading.service';
import { 
  MeterReading, 
  MeterReadingResponse, 
  MeterReadingProgress,
  MeterReadingQueryParams
} from '../../../../models/meter-reading.model';

@Component({
  selector: 'app-meter-reading-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meter-reading-list.component.html',
  styleUrls: ['./meter-reading-list.component.css']
})
export class MeterReadingListComponent implements OnInit {
  // Make Math available in the template
  Math = Math;
  meterReadings: MeterReading[] = [];
  filteredReadings: MeterReading[] = [];
  groupedReadings: Array<{
    apartmentCode: string;
    waterReading?: MeterReading;
    electricReading?: MeterReading;
  }> = [];
  buildings: BuildingDto[] = [];
  loading = false;
  error = '';
  successMessage = '';
  generatingInvoices = false;
  progressData: {
    buildingId: string;
    billingPeriod: string;
    totalApartments: number;
    recordedByMeterType: { [key: string]: number };
    progressByMeterType: { [key: string]: number };
    lastUpdated: string;
  } | null = null;
  
  // Filter properties
  selectedBuilding: string = '';
  selectedPeriod = this.getCurrentMonthPeriod();
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private buildingService: BuildingService,
    private meterReadingService: MeterReadingService
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
    this.loadMeterReadings();
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
    
    this.meterReadingService.getReadingProgress(this.selectedBuilding, this.selectedPeriod)
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.progressData = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading progress data:', error);
          // Don't show error to user as it's a secondary feature
        }
      });
  }

  onBuildingChange(): void {
    this.loadMeterReadings();
    this.loadProgressData();
  }

  onPeriodChange(): void {
    this.loadMeterReadings();
    this.loadProgressData();
  }

  loadMeterReadings(): void {
    if (!this.selectedBuilding || !this.selectedPeriod) {
      return;
    }

    this.loading = true;
    const params: MeterReadingQueryParams = {
      buildingCode: this.selectedBuilding,
      billingPeriod: this.selectedPeriod,
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage
    };
    
    this.meterReadingService.getRecordedReadings(params).subscribe({
      next: (response) => {
        this.meterReadings = response.data;
        this.totalItems = response.totalCount || 0;
        this.filteredReadings = [...this.meterReadings];
        this.groupReadingsByApartment();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading meter readings:', error);
        this.error = 'Có lỗi xảy ra khi tải dữ liệu';
        this.loading = false;
      }
    });
  }

  filterReadings(): void {
    this.filteredReadings = [...this.meterReadings];
    this.groupReadingsByApartment();
    this.currentPage = 1;
  }


  getCurrentMonthPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  groupReadingsByApartment(): void {
    const grouped = new Map<string, {
      apartmentCode: string;
      waterReading?: MeterReading;
      electricReading?: MeterReading;
    }>();

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
  }

  get paginatedGroups(): Array<{
    apartmentCode: string;
    waterReading?: MeterReading;
    electricReading?: MeterReading;
  }> {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.groupedReadings.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages().length) {
      this.currentPage = page;
    }
  }

  getTotalPages(): number[] {
    return Array(Math.ceil(this.totalItems / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
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

    this.generatingInvoices = true;
    this.error = '';
    this.successMessage = '';

    this.meterReadingService.generateInvoices(this.selectedBuilding).subscribe({
      next: (response) => {
        this.generatingInvoices = false;
        if (response.succeeded) {
          this.successMessage = response.message || 'Tạo hóa đơn thành công!';
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
        console.error('Error generating invoices:', error);
        this.error = error.error?.message || 'Có lỗi xảy ra khi tạo hóa đơn';
      }
    });
  }
}
