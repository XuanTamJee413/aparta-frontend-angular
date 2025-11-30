import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InvoiceManagementService } from '../../../../services/finance/invoice-management.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { InvoiceGroupDto, InvoiceDto } from '../../../../models/invoice-management.model';

// Interface for parsed description
export interface ParsedDescription {
  itemDescription: string;
  note?: string;
  evidenceUrls: string[];
  rawText: string;
}

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoice-management.component.html',
  styleUrls: ['./invoice-management.component.css']
})
export class InvoiceManagementComponent implements OnInit {
  // Tab management
  activeTab: 'monthly' | 'one-time' = 'monthly';
  
  // Common
  buildings: BuildingDto[] = [];
  selectedBuildingId: string = '';
  selectedStatus: string = 'Tất cả';
  apartmentCodeSearch: string = '';
  
  // Monthly invoices
  invoiceGroups: InvoiceGroupDto[] = [];
  flatInvoices: InvoiceDto[] = [];
  
  // One-time invoices
  oneTimeInvoices: InvoiceDto[] = [];
  
  isLoading = false;
  error: string | null = null;
  
  // Confirmation modal state
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'delete' | 'markPaid' | null = null;
  pendingInvoiceId: string | null = null;
  successMessage: string | null = null;
  
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
            // Load invoices based on active tab
            if (this.activeTab === 'monthly') {
              this.loadInvoices();
            } else {
              this.loadOneTimeInvoices();
            }
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

  // Tải danh sách hóa đơn tháng
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
      apartmentCode,
      'MONTHLY_BILLING'
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

  // Tải danh sách hóa đơn one-time
  loadOneTimeInvoices(): void {
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
      apartmentCode,
      'ONE_TIME'
    ).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Flatten invoices from groups
          this.oneTimeInvoices = [];
          response.data.forEach(group => {
            group.invoices.forEach(invoice => {
              if (invoice.feeType === 'ONE_TIME') {
                this.oneTimeInvoices.push({
                  ...invoice,
                  apartmentCode: group.apartmentCode,
                  residentName: group.residentName
                });
              }
            });
          });
        } else {
          this.oneTimeInvoices = [];
          this.error = response.message || 'Không thể tải danh sách hóa đơn';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Không thể tải danh sách hóa đơn';
        this.oneTimeInvoices = [];
        this.isLoading = false;
      }
    });
  }

  // Chuyển đổi invoiceGroups thành flat list để hiển thị trong table
  flattenInvoices(): void {
    this.flatInvoices = [];
    
    this.invoiceGroups.forEach(group => {
      group.invoices.forEach(invoice => {
        // Only show monthly invoices
        if (invoice.feeType === 'MONTHLY_BILLING') {
          const flatInvoice = {
            ...invoice,
            apartmentCode: group.apartmentCode,
            residentName: group.residentName
          };
          this.flatInvoices.push(flatInvoice);
        }
      });
    });
  }

  // Tab switching
  switchTab(tab: 'monthly' | 'one-time'): void {
    this.activeTab = tab;
    if (tab === 'monthly') {
      this.loadInvoices();
    } else {
      this.loadOneTimeInvoices();
    }
  }

  // Xử lý khi thay đổi building
  onBuildingChange(): void {
    if (this.activeTab === 'monthly') {
      this.loadInvoices();
    } else {
      this.loadOneTimeInvoices();
    }
  }

  // Xử lý khi thay đổi status
  onStatusChange(): void {
    if (this.activeTab === 'monthly') {
      this.loadInvoices();
    } else {
      this.loadOneTimeInvoices();
    }
  }

  // Xử lý khi search apartment code (live search)
  onApartmentCodeSearch(): void {
    if (this.activeTab === 'monthly') {
      this.loadInvoices();
    } else {
      this.loadOneTimeInvoices();
    }
  }

  // Xử lý khi click nút Search
  onSearchClick(): void {
    if (this.activeTab === 'monthly') {
      this.loadInvoices();
    } else {
      this.loadOneTimeInvoices();
    }
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

  // Parse description from JSON (for one-time invoices)
  parseDescription(description: string): ParsedDescription {
    if (!description) {
      return {
        itemDescription: '',
        note: undefined,
        evidenceUrls: [],
        rawText: ''
      };
    }

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(description);
      
      return {
        itemDescription: parsed.itemDescription || '',
        note: parsed.note || undefined,
        evidenceUrls: Array.isArray(parsed.evidenceUrls) ? parsed.evidenceUrls : [],
        rawText: parsed.itemDescription + (parsed.note ? `. ${parsed.note}` : '')
      };
    } catch (e) {
      // Fallback: If not JSON, try to parse old format (for backward compatibility)
      const evidenceMatch = description.match(/\[Evidence: ([^\]]+)\]/);
      let evidenceUrls: string[] = [];
      let textWithoutEvidence = description;

      if (evidenceMatch) {
        const evidenceText = evidenceMatch[1];
        evidenceUrls = evidenceText.split(';').map((url: string) => url.trim()).filter((url: string) => url);
        textWithoutEvidence = description.replace(/\[Evidence: [^\]]+\]/, '').trim();
      }

      // Split itemDescription and note (format: "ItemDescription. Note")
      const parts = textWithoutEvidence.split('.').map((p: string) => p.trim()).filter((p: string) => p);
      
      let itemDescription = parts[0] || '';
      let note: string | undefined = undefined;

      if (parts.length > 1) {
        // Join remaining parts as note (in case note contains multiple sentences)
        note = parts.slice(1).join('. ').trim();
      }

      return {
        itemDescription,
        note: note || undefined,
        evidenceUrls,
        rawText: textWithoutEvidence
      };
    }
  }

  viewEvidence(url: string): void {
    window.open(url, '_blank');
  }

  markAsPaid(invoiceId: string): void {
    this.pendingInvoiceId = invoiceId;
    this.confirmModalType = 'markPaid';
    this.confirmModalTitle = 'Xác nhận đánh dấu đã thanh toán';
    this.confirmModalMessage = 'Bạn có chắc chắn muốn đánh dấu hóa đơn này là đã thanh toán?';
    this.showConfirmModal = true;
  }

  deleteInvoice(invoiceId: string): void {
    this.pendingInvoiceId = invoiceId;
    this.confirmModalType = 'delete';
    this.confirmModalTitle = 'Xác nhận xóa hóa đơn';
    this.confirmModalMessage = 'Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác.';
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (!this.pendingInvoiceId || !this.confirmModalType) {
      return;
    }

    this.showConfirmModal = false;

    if (this.confirmModalType === 'markPaid') {
      this.invoiceService.markInvoiceAsPaid(this.pendingInvoiceId).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.successMessage = 'Đã đánh dấu hóa đơn là đã thanh toán';
            setTimeout(() => {
              this.successMessage = null;
            }, 3000);
            this.loadOneTimeInvoices();
          } else {
            this.error = response.message || 'Có lỗi xảy ra';
          }
        },
        error: (error) => {
          this.error = error.error?.message || 'Có lỗi xảy ra';
        }
      });
    } else if (this.confirmModalType === 'delete') {
      this.invoiceService.deleteInvoice(this.pendingInvoiceId).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.successMessage = 'Đã xóa hóa đơn';
            setTimeout(() => {
              this.successMessage = null;
            }, 3000);
            this.loadOneTimeInvoices();
          } else {
            this.error = response.message || 'Có lỗi xảy ra';
          }
        },
        error: (error) => {
          this.error = error.error?.message || 'Có lỗi xảy ra';
        }
      });
    }

    // Reset state
    this.pendingInvoiceId = null;
    this.confirmModalType = null;
  }

  cancelAction(): void {
    this.showConfirmModal = false;
    this.pendingInvoiceId = null;
    this.confirmModalType = null;
  }

}

