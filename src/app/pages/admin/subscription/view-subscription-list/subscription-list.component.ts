import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// Các module Material vẫn cần thiết cho logic modal và datepicker, tab
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { 
  SubscriptionService, 
  SubscriptionDto, 
  SubscriptionQueryParameters 
} from '../../../../services/admin/subscription.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';
import { SubscriptionFormModalComponent } from '../subscription-form-modal/subscription-form-modal.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css']
})
export class SubscriptionListComponent implements OnInit {
  subscriptions: SubscriptionDto[] = [];
  projects: ProjectDto[] = [];
  isLoading = false;
  
  // Filter options
  selectedStatus: string = 'All';
  selectedDateType: string = 'created';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  // Options cho Dropdown loại ngày
  dateTypeOptions = [
    { value: 'created', label: 'Ngày tạo' },
    { value: 'payment', label: 'Ngày thanh toán' },
    { value: 'expired', label: 'Ngày hết hạn' },
    { value: 'start', label: 'Ngày bắt đầu' }
  ];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  
  // Current tab: 'main' or 'draft'
  currentTab: 'main' | 'draft' = 'main';

  statusOptions = [
    { value: 'All', label: '-- Tất cả trạng thái --' },
    { value: 'Active', label: 'Hoạt động' },
    { value: 'Expired', label: 'Đã hết hạn' },
    { value: 'Cancelled', label: 'Đã hủy' }
  ];

  // Helper cho template
  Math = Math;

  constructor(
    private subscriptionService: SubscriptionService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadSubscriptions();
  }

  loadProjects(): void {
    this.projectService.getAllProjects({ isActive: true }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.projects = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    const queryParams: SubscriptionQueryParameters = {
      status: this.currentTab === 'draft' ? 'Draft' : (this.selectedStatus || undefined),
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      dateType: this.selectedDateType,
      skip: (this.currentPage - 1) * this.pageSize,
      take: this.pageSize
    };

    // If on main tab and no status filter, exclude Draft
    if (this.currentTab === 'main' && !this.selectedStatus) {
      queryParams.status = 'All';
    }

    this.subscriptionService.getAllSubscriptions(queryParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded && response.data) {
          // Filter out Draft on main tab if no specific status selected
          if (this.currentTab === 'main' && !this.selectedStatus) {
            this.subscriptions = response.data.items.filter(s => s.status !== 'Draft');
          } else {
            this.subscriptions = response.data.items;
          }
          this.totalCount = response.data.totalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        } else {
          this.showError(response.message || 'Không thể tải danh sách subscription');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || error.message || 'Lỗi khi tải danh sách subscription';
        this.showError(errorMessage);
        console.error('Error loading subscriptions:', error);
      }
    });
  }

  onTabChange(index: number): void {
    this.currentTab = index === 0 ? 'main' : 'draft';
    // Clear filters when switching tabs
    this.clearFilter();
  }

  applyFilter(): void {
    // Validate date range
    if (this.fromDate && this.toDate) {
      if (this.fromDate > this.toDate) {
        this.showError('Từ ngày phải trước hoặc bằng đến ngày');
        return;
      }
    }
    
    this.currentPage = 1;
    this.loadSubscriptions();
  }

  clearFilter(): void {
    this.selectedStatus = 'All';
    this.fromDate = null;
    this.toDate = null;
    this.selectedDateType = this.currentTab === 'draft' ? 'created' : 'payment';
    this.currentPage = 1;
    this.loadSubscriptions();
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(SubscriptionFormModalComponent, {
      width: '700px',
      data: { mode: 'create', subscription: null }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSubscriptions();
      }
    });
  }

  openEditModal(subscription: SubscriptionDto): void {
    const dialogRef = this.dialog.open(SubscriptionFormModalComponent, {
      width: '700px',
      data: { mode: 'edit', subscription: subscription }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSubscriptions();
      }
    });
  }

  openViewModal(subscription: SubscriptionDto): void {
    const dialogRef = this.dialog.open(SubscriptionFormModalComponent, {
      width: '700px',
      data: { mode: 'view', subscription: subscription }
    });
  }

  openDeleteDialog(subscription: SubscriptionDto): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: { subscription: subscription }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSubscription(subscription.subscriptionId);
      }
    });
  }

  deleteSubscription(id: string): void {
    this.subscriptionService.deleteSubscriptionDraft(id).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.showSuccess('Xóa bản nháp thành công');
          this.loadSubscriptions();
        } else {
          this.showError(response.message || 'Không thể xóa bản nháp');
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.message || 'Lỗi khi xóa bản nháp';
        this.showError(errorMessage);
        console.error('Error deleting subscription:', error);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSubscriptions();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadSubscriptions();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  calculateStartDate(subscription: SubscriptionDto): Date | null {
    if (!subscription.expiredAt || !subscription.numMonths) {
      return null;
    }
    const expiredDate = new Date(subscription.expiredAt);
    const startDate = new Date(expiredDate);
    startDate.setMonth(startDate.getMonth() - subscription.numMonths);
    
    return startDate;
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    if (option) return option.label;
    
    // Mapping thêm cho trường hợp Draft
    if (status === 'Draft') return 'Nháp';
    return status;
  }

  // Cập nhật để trả về đúng class mới trong CSS
  getStatusClass(status: string): string {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Expired': return 'status-expired';
      case 'Draft': return 'status-draft';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-cancelled';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right', // Đổi về right cho giống Building List
      verticalPosition: 'top',
      panelClass: ['bg-success', 'text-white'] // Dùng style bootstrap cho snackbar nếu có, hoặc custom class
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['bg-danger', 'text-white']
    });
  }
}