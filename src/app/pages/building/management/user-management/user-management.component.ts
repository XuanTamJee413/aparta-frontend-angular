/* --- File: src/app/pages/building/management/user-management/user-management.component.ts --- */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Modules
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Đã import

// Services & RXJS
import { PagedList, UserAccountDto, UserManagementService, UserQueryParams } from '../../../../services/management/user-management.service';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CreateStaffComponent } from './create-staff/create-staff.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatDialogModule // Cần thêm module này vào imports
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  // Trạng thái chung
  activeTab: 'staffs' | 'residents' = 'staffs';
  isLoading = false;
  
  // --- STAFF CONFIG ---
  staffs: UserAccountDto[] = [];
  staffsPagedList: PagedList<UserAccountDto> | null = null;
  
  // Query Params cho Staff
  staffQueryParams: UserQueryParams = { 
    pageNumber: 1, 
    pageSize: 10, 
    status: undefined, 
    searchTerm: '',
    sortColumn: 'createdAt',
    sortDirection: 'desc'
  };
  staffDisplayedColumns: string[] = ['name', 'role', 'contact', 'assignment', 'status', 'actions'];

  // --- RESIDENT CONFIG ---
  residents: UserAccountDto[] = [];
  residentsPagedList: PagedList<UserAccountDto> | null = null;
  
  // Query Params cho Resident
  residentQueryParams: UserQueryParams = { 
    pageNumber: 1, 
    pageSize: 10, 
    status: 'Active',
    searchTerm: '',
    sortColumn: 'name',
    sortDirection: 'asc'
  };
  residentDisplayedColumns: string[] = ['name', 'apartmentCode', 'contact', 'status', 'actions'];

  // Status Options
  statusOptions = [
    { value: undefined, label: 'Tất cả trạng thái' },
    { value: 'Active', label: 'Đang hoạt động' },
    { value: 'Inactive', label: 'Vô hiệu hóa' }
  ];

  // Subject debounce
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // [FIX] Đã thêm Inject Dialog
  ) { }

  ngOnInit(): void {
    this.loadStaffs();

    // Cấu hình Debounce Search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (this.activeTab === 'staffs') {
        this.staffQueryParams.searchTerm = searchTerm;
        this.staffQueryParams.pageNumber = 1;
        this.loadStaffs();
      } else {
        this.residentQueryParams.searchTerm = searchTerm;
        this.residentQueryParams.pageNumber = 1;
        this.loadResidents();
      }
    });
  }

  // [FIX] Hàm loadData tổng quát (để gọi lại sau khi đóng dialog)
  loadData(): void {
    if (this.activeTab === 'staffs') {
      this.loadStaffs();
    } else {
      this.loadResidents();
    }
  }

  openCreateStaffDialog() {
    const dialogRef = this.dialog.open(CreateStaffComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false
    });

    // [FIX] Thêm kiểu boolean cho result để tránh lỗi implicit any
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.snackBar.open('Thêm nhân viên thành công!', 'Đóng', { duration: 3000, panelClass: ['success-snackbar'] });
        this.loadData(); // Reload lại dữ liệu
      }
    });
  }

  // --- Xử lý Tabs ---
  setActiveTab(tab: 'staffs' | 'residents'): void {
    this.activeTab = tab;
    if (tab === 'staffs' && this.staffs.length === 0) {
      this.loadStaffs();
    } else if (tab === 'residents' && this.residents.length === 0) {
      this.loadResidents();
    }
  }

  // --- Xử lý Search Input ---
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  // --- Xử lý Filter Status ---
  onStatusChange(): void {
    if (this.activeTab === 'staffs') {
      this.staffQueryParams.pageNumber = 1;
      this.loadStaffs();
    } else {
      this.residentQueryParams.pageNumber = 1;
      this.loadResidents();
    }
  }

  // --- Xử lý Sort ---
  onSortChange(sortState: Sort): void {
    if (this.activeTab === 'staffs') {
      this.staffQueryParams.sortColumn = sortState.active;
      this.staffQueryParams.sortDirection = sortState.direction === '' ? undefined : sortState.direction;
      this.loadStaffs();
    } else {
      this.residentQueryParams.sortColumn = sortState.active;
      this.residentQueryParams.sortDirection = sortState.direction === '' ? undefined : sortState.direction;
      this.loadResidents();
    }
  }

  // --- Load Data API ---
  loadStaffs(): void {
    this.isLoading = true;
    this.userService.getStaffAccounts(this.staffQueryParams)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.staffs = response.data.items;
            this.staffsPagedList = response.data;
          } else {
            this.snackBar.open(response.message || 'Lỗi tải dữ liệu nhân viên.', 'Đóng', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Lỗi hệ thống.', 'Đóng', { duration: 3000 });
        }
      });
  }

  loadResidents(): void {
    this.isLoading = true;
    this.userService.getResidentAccounts(this.residentQueryParams)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.residents = response.data.items;
            this.residentsPagedList = response.data;
          } else {
            this.snackBar.open(response.message || 'Lỗi tải dữ liệu cư dân.', 'Đóng', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Lỗi hệ thống.', 'Đóng', { duration: 3000 });
        }
      });
  }

  // --- Pagination ---
  onStaffPageChange(pageIndex: number): void {
    this.staffQueryParams.pageNumber = pageIndex + 1;
    this.loadStaffs();
  }

  onResidentPageChange(pageIndex: number): void {
    this.residentQueryParams.pageNumber = pageIndex + 1;
    this.loadResidents();
  }
  
  // --- Toggle Status ---
  toggleStatus(user: UserAccountDto): void {
    const isCurrentlyActive = user.status.toLowerCase() === 'active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    if (!confirm(`Xác nhận ${newStatus === 'Active' ? 'KÍCH HOẠT' : 'VÔ HIỆU HÓA'} tài khoản ${user.name}?`)) {
        return;
    }
    
    this.isLoading = true;
    this.userService.toggleUserStatus(user.userId, { status: newStatus as 'Active' | 'Inactive' })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            user.status = newStatus.toLowerCase(); 
            this.snackBar.open('Cập nhật trạng thái thành công.', 'Đóng', { duration: 3000 });
          } else {
            this.snackBar.open('Cập nhật thất bại.', 'Đóng', { duration: 3000 });
          }
        },
        error: () => this.snackBar.open('Lỗi kết nối.', 'Đóng', { duration: 3000 })
      });
  }
}