import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MeterReadingService } from '../../../../services/operation/meter-reading.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { MeterReadingStatusDto } from '../../../../models/meter-reading.model';
import { BillingService } from '../../../../services/billing.service';
import { AuthService } from '../../../../services/auth.service';
import { ProfileService } from '../../../../services/profile.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-meter-reading-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './meter-reading-status.component.html',
  styleUrls: ['./meter-reading-status.component.css']
})
export class MeterReadingStatusComponent implements OnInit {
  buildings: BuildingDto[] = [];
  filteredBuildings: BuildingDto[] = [];
  buildingSearchText: string = '';
  selectedBuildingId: string = '';
  billingPeriodInput: string = ''; // Format: yyyy-MM for native month input
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
  pageSize = 10;
  pageIndex = 0;
  totalApartments = 0;
  
  loadingBuildings = false;
  loadingStatus = false;
  hasData = false;
  isGenerating = false;
  
  // Toast notification
  private toastTimeout: any;

  constructor(
    public authService: AuthService,
    private meterReadingService: MeterReadingService,
    private buildingService: BuildingService,
    private billingService: BillingService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Mặc định hiển thị kỳ ghi chỉ số là THÁNG TRƯỚC (giống màn nhập chỉ số)
    this.billingPeriod = this.getCurrentBillingPeriod();
    this.billingPeriodInput = this.billingPeriod; // Set initial value for month input (type="month")
    this.loadBuildings();
  }

  // Lấy billing period mặc định (yyyy-MM) - là THÁNG TRƯỚC vì ghi/đối soát cho kỳ vừa qua
  getCurrentBillingPeriod(): string {
    const now = new Date();
    // Lấy tháng trước (vd: đang 2025-03 thì kỳ là 2025-02)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = previousMonth.getFullYear();
    const month = String(previousMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Xử lý khi thay đổi month input
  onMonthInputChange(): void {
    if (this.billingPeriodInput) {
      this.billingPeriod = this.billingPeriodInput;
      if (this.selectedBuildingId) {
        this.loadStatus();
      }
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
    
    // Kiểm tra role: tất cả role (trừ admin) chỉ thấy building được gán
    const user = this.authService.user();
    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';
    
    if (!isAdmin) {
      // Load buildings từ profile (assignedBuildings) cho tất cả role (manager, finance_staff, operation_staff, etc.)
      this.profileService.getProfile().subscribe({
        next: (response) => {
          if (response.succeeded && response.data?.currentAssignments) {
            // Map currentAssignments thành BuildingDto format
            this.buildings = response.data.currentAssignments.map(assignment => ({
              buildingId: assignment.buildingId,
              name: assignment.buildingName,
              buildingCode: assignment.buildingId, // Fallback nếu không có code
              projectId: '',
              numApartments: 0,
              numResidents: 0,
              totalFloors: 0,
              totalBasements: 0,
              readingWindowStart: 1,
              readingWindowEnd: 31,
              isActive: true,
              description: '',
              createdAt: assignment.startDate,
              updatedAt: assignment.startDate
            } as BuildingDto));
            
            this.filteredBuildings = [...this.buildings];
            // Auto-select building đầu tiên
            if (this.buildings.length > 0 && !this.selectedBuildingId) {
              this.selectedBuildingId = this.buildings[0].buildingId;
              // Tự động load status nếu đã có billing period
              if (this.billingPeriod) {
                this.loadStatus();
              }
            }
          } else {
            this.buildings = [];
            this.filteredBuildings = [];
            this.showError('Không có building nào được gán cho bạn');
          }
          this.loadingBuildings = false;
        },
        error: (error) => {
          this.showError('Không thể tải danh sách tòa nhà');
          this.loadingBuildings = false;
        }
      });
    } else {
      // Admin: load tất cả buildings
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
  }

  // Xử lý khi chọn building
  onBuildingChange(): void {
    if (this.selectedBuildingId && this.billingPeriod) {
      this.loadStatus();
    }
  }

  // Xử lý khi click nút tìm kiếm
  onSearchClick(): void {
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

  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.totalApartments / this.pageSize);
  }

  getStartIndex(): number {
    return this.pageIndex * this.pageSize;
  }

  getEndIndex(): number {
    const end = (this.pageIndex + 1) * this.pageSize;
    return end > this.totalApartments ? this.totalApartments : end;
  }

  goToFirstPage(): void {
    this.pageIndex = 0;
  }

  goToPreviousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  goToNextPage(): void {
    if (this.pageIndex < this.getTotalPages() - 1) {
      this.pageIndex++;
    }
  }

  goToLastPage(): void {
    this.pageIndex = this.getTotalPages() - 1;
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

  // Toast Notification Methods
  toast = {
    show: false,
    message: '',
    type: 'success' // 'success' or 'error'
  };

  showToast(message: string, type: 'success' | 'error' = 'success', duration: number = 5000): void {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, duration);
  }

  hideToast(): void {
    this.toast.show = false;
  }

  // Hiển thị thông báo lỗi
  showError(message: string): void {
    this.showToast(message, 'error', 5000);
  }

  // Hiển thị thông báo thành công
  showSuccess(message: string): void {
    this.showToast(message, 'success', 3000);
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

