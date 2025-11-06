import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InvoiceManagementService } from '../../../../services/finance/invoice-management.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { InvoiceGroupDto, InvoiceDto } from '../../../../models/invoice-management.model';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoice-management.component.html',
  styleUrls: ['./invoice-management.component.css']
})
export class InvoiceManagementComponent implements OnInit {
  buildings: BuildingDto[] = [];
  selectedBuildingId: string = '';
  selectedStatus: string = 'Tất cả';
  apartmentCodeSearch: string = '';
  
  invoiceGroups: InvoiceGroupDto[] = [];
  flatInvoices: InvoiceDto[] = [];
  
  isLoading = false;
  error: string | null = null;
  
  statusOptions: { value: string; label: string }[] = [
    { value: 'Tất cả', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ thanh toán' },
    { value: 'PAID', label: 'Đã thanh toán' }
  ];
  
  constructor(
    private invoiceService: InvoiceManagementService,
    private buildingService: BuildingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  // Tải danh sách tòa nhà
  loadBuildings(): void {
    this.isLoading = true;
    this.buildingService.getAllBuildings({ take: 100 }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.items) {
          this.buildings = response.data.items.filter(b => b.isActive);
          // Auto-select building đầu tiên
          if (this.buildings.length > 0 && !this.selectedBuildingId) {
            this.selectedBuildingId = this.buildings[0].buildingId;
            this.loadInvoices();
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách tòa nhà';
        this.isLoading = false;
      }
    });
  }

  // Tải danh sách hóa đơn
  loadInvoices(): void {
    if (!this.selectedBuildingId) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    const status = this.selectedStatus === 'Tất cả' ? undefined : this.selectedStatus;
    const apartmentCode = this.apartmentCodeSearch.trim() || undefined;

    this.invoiceService.getInvoicesByBuilding(
      this.selectedBuildingId,
      status,
      apartmentCode
    ).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.invoiceGroups = response.data;
          this.flattenInvoices();
        } else {
          this.invoiceGroups = [];
          this.flatInvoices = [];
          this.error = response.message || 'Không thể tải danh sách hóa đơn';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Không thể tải danh sách hóa đơn';
        this.invoiceGroups = [];
        this.flatInvoices = [];
        this.isLoading = false;
      }
    });
  }

  // Chuyển đổi invoiceGroups thành flat list để hiển thị trong table
  flattenInvoices(): void {
    this.flatInvoices = [];
    this.invoiceGroups.forEach(group => {
      group.invoices.forEach(invoice => {
        this.flatInvoices.push({
          ...invoice,
          apartmentCode: group.apartmentCode,
          residentName: group.residentName
        });
      });
    });
  }

  // Xử lý khi thay đổi building
  onBuildingChange(): void {
    this.loadInvoices();
  }

  // Xử lý khi thay đổi status
  onStatusChange(): void {
    this.loadInvoices();
  }

  // Xử lý khi search apartment code (live search)
  onApartmentCodeSearch(): void {
    this.loadInvoices();
  }

  // Xử lý khi click nút Search
  onSearchClick(): void {
    this.loadInvoices();
  }

  // Navigate đến detail view
  viewDetail(invoiceId: string): void {
    this.router.navigate(['/manager/invoice-detail', invoiceId]);
  }

  // Format date
  formatDate(date: string): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return date;
    }
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Get status class
  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'status-paid';
      case 'PENDING':
        return 'status-pending';
      case 'OVERDUE':
        return 'status-overdue';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // Get status label
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }
}

