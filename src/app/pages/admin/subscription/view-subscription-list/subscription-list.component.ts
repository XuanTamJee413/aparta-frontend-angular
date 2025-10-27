import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
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
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
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
  selectedStatus: string = '';
  createdAtStart: Date | null = null;
  createdAtEnd: Date | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  
  // Current tab: 'main' or 'draft'
  currentTab: 'main' | 'draft' = 'main';
  
  statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'Active', label: 'Đang hoạt động' },
    { value: 'Expired', label: 'Đã hết hạn' }
  ];

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
      createdAtStart: this.createdAtStart || undefined,
      createdAtEnd: this.createdAtEnd || undefined,
      skip: (this.currentPage - 1) * this.pageSize,
      take: this.pageSize
    };

    // If on main tab and no status filter, exclude Draft
    if (this.currentTab === 'main' && !this.selectedStatus) {
      // Load both Active and Expired (exclude Draft)
      queryParams.status = undefined; // Will load all, then filter on client side if needed
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
    this.currentPage = 1;
    this.selectedStatus = '';
    this.loadSubscriptions();
  }

  applyFilter(): void {
    // Validate date range
    if (this.createdAtStart && this.createdAtEnd) {
      if (this.createdAtStart > this.createdAtEnd) {
        this.showError('Từ ngày phải trước hoặc bằng đến ngày');
        return;
      }
    }
    
    this.currentPage = 1;
    this.loadSubscriptions();
  }

  clearFilter(): void {
    this.selectedStatus = '';
    this.createdAtStart = null;
    this.createdAtEnd = null;
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

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.projectId === projectId);
    return project ? project.name || project.projectCode || projectId : projectId;
  }

  calculateStartDate(subscription: SubscriptionDto): Date | null {
    if (!subscription.expiredAt || !subscription.numMonths) {
      return null;
    }

    // Convert to Date if it's a string
    const expiredDate = new Date(subscription.expiredAt);
    
    // Subtract numMonths from expiredAt
    const startDate = new Date(expiredDate);
    startDate.setMonth(startDate.getMonth() - subscription.numMonths);
    
    // Add 1 day
    startDate.setDate(startDate.getDate() + 1);
    
    return startDate;
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Active': return 'badge-success';
      case 'Expired': return 'badge-danger';
      case 'Draft': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Helper method for template
  Math = Math;
}
