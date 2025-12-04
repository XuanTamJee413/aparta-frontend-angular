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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatDialogModule
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
    private dialog: MatDialog
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

  loadData(): void {
    if (this.activeTab === 'staffs') {
      this.loadStaffs();
    } else {
      this.loadResidents();
    }
  }

  openStaffDialog(staff?: UserAccountDto) {
    const dialogRef = this.dialog.open(CreateStaffComponent, {
      width: '700px', // Tăng chiều rộng một chút
      disableClose: true,
      autoFocus: false,
      data: { staff: staff } // Truyền data sang dialog
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // Nếu trả về true nghĩa là có thay đổi -> reload data
        this.loadData();
      }
    });
  }

  setActiveTab(tab: 'staffs' | 'residents'): void {
    this.activeTab = tab;
    // Reset data if needed or just switch
    if (tab === 'staffs') {
        if (this.staffs.length === 0) this.loadStaffs();
    } else {
        if (this.residents.length === 0) this.loadResidents();
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onStatusChange(): void {
    if (this.activeTab === 'staffs') {
      this.staffQueryParams.pageNumber = 1;
      this.loadStaffs();
    } else {
      this.residentQueryParams.pageNumber = 1;
      this.loadResidents();
    }
  }

  onSortChange(sortState: Sort): void {
    // Chuyển đổi Sort Direction của Angular Material ('asc' | 'desc' | '') sang API
    const direction = sortState.direction === '' ? undefined : sortState.direction;
    
    if (this.activeTab === 'staffs') {
      this.staffQueryParams.sortColumn = sortState.active;
      this.staffQueryParams.sortDirection = direction;
      this.loadStaffs();
    } else {
      this.residentQueryParams.sortColumn = sortState.active;
      this.residentQueryParams.sortDirection = direction;
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
          this.snackBar.open('Lỗi hệ thống khi tải danh sách nhân viên.', 'Đóng', { duration: 3000 });
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
          this.snackBar.open('Lỗi hệ thống khi tải danh sách cư dân.', 'Đóng', { duration: 3000 });
        }
      });
  }

  onStaffPageChange(pageIndex: number): void {
    this.staffQueryParams.pageNumber = pageIndex + 1;
    this.loadStaffs();
  }

  onResidentPageChange(pageIndex: number): void {
    this.residentQueryParams.pageNumber = pageIndex + 1;
    this.loadResidents();
  }
  
  toggleStatus(user: UserAccountDto): void {
    const isCurrentlyActive = user.status.toLowerCase() === 'active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    if (!confirm(`Xác nhận ${newStatus === 'Active' ? 'KÍCH HOẠT' : 'VÔ HIỆU HÓA'} tài khoản ${user.name}?`)) {
        return;
    }
    
    this.isLoading = true;
    // Gọi API với string status trực tiếp (Service sẽ đóng gói thành object)
    this.userService.toggleUserStatus(user.userId, newStatus)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            // Update UI
            user.status = response.data.status; 
            this.snackBar.open('Cập nhật trạng thái thành công.', 'Đóng', { duration: 3000 });
          } else {
            this.snackBar.open(response.message || 'Cập nhật thất bại.', 'Đóng', { duration: 3000 });
          }
        },
        error: () => this.snackBar.open('Lỗi kết nối.', 'Đóng', { duration: 3000 })
      });
  }
}