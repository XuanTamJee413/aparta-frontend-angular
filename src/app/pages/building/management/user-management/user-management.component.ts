/* --- File: src/app/pages/building/management/user-management/user-management.component.ts --- */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule, MatChipListbox } from '@angular/material/chips';
import { PagedList, UserAccountDto, UserManagementService, UserQueryParams } from '../../../../services/management/user-management.service';
import { finalize } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  // Trạng thái chung
  activeTab: 'staffs' | 'residents' = 'staffs';
  isLoading = false;
  
  // Trạng thái Staff
  staffs: UserAccountDto[] = [];
  staffsPagedList: PagedList<UserAccountDto> | null = null;
  staffQueryParams: UserQueryParams = { pageNumber: 1, pageSize: 10, status: undefined };
  staffDisplayedColumns: string[] = ['name', 'role', 'contact', 'assignment', 'status', 'actions'];

  // Trạng thái Resident
  residents: UserAccountDto[] = [];
  residentsPagedList: PagedList<UserAccountDto> | null = null;
  residentQueryParams: UserQueryParams = { pageNumber: 1, pageSize: 10, status: 'Active' };
  residentDisplayedColumns: string[] = ['name', 'apartmentCode', 'contact', 'status', 'actions'];

  constructor(
    private userService: UserManagementService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadStaffs();
  }

  // --- Điều khiển Tab ---
  setActiveTab(tab: 'staffs' | 'residents'): void {
    this.activeTab = tab;
    if (tab === 'staffs' && (this.staffs.length === 0 || !this.staffsPagedList)) {
      this.loadStaffs();
    } else if (tab === 'residents' && (this.residents.length === 0 || !this.residentsPagedList)) {
      this.loadResidents();
    }
  }

// --- Logic Staff ---
  loadStaffs(): void {
    this.isLoading = true;
    this.userService.getStaffAccounts(this.staffQueryParams)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('API Response Success (Staff):', response); // LOG PHẢN HỒI THÀNH CÔNG

          if (response.succeeded && response.data) {
            this.staffs = response.data.items;
            this.staffsPagedList = response.data;
            
            // Nếu có kết quả nhưng không thấy gì, kiểm tra xem data.items có bị lỗi gán không.
            if (response.data.totalCount === 0) {
                 this.snackBar.open(response.message || 'Không tìm thấy nhân viên nào.', 'Đóng', { duration: 3000 });
            }
            
          } else {
            // Trường hợp này không xảy ra với dữ liệu bạn cung cấp, nhưng giữ lại để bắt lỗi.
            this.snackBar.open(response.message || 'Lỗi nghiệp vụ khi tải danh sách nhân viên.', 'Đóng', { duration: 5000 });
          }
        },
        error: (err) => {
          console.error('LỖI TẢI DANH SÁCH STAFF:', err); 
          // Hiển thị lỗi mạng nếu xảy ra
          this.snackBar.open('Lỗi không xác định khi tải dữ liệu. Kiểm tra console.', 'Đóng', { duration: 5000 });
        }
      });
  }
  
  // --- Logic Resident ---
  loadResidents(): void {
    this.isLoading = true;
    this.userService.getResidentAccounts(this.residentQueryParams)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('API Response Success (Resident):', response); // LOG PHẢN HỒI THÀNH CÔNG

          if (response.succeeded && response.data) {
            this.residents = response.data.items;
            this.residentsPagedList = response.data;

            if (response.data.totalCount === 0) {
                 this.snackBar.open(response.message || 'Không tìm thấy cư dân nào.', 'Đóng', { duration: 3000 });
            }

          } else {
            this.snackBar.open(response.message || 'Lỗi nghiệp vụ khi tải danh sách cư dân.', 'Đóng', { duration: 5000 });
          }
        },
        error: (err) => {
          console.error('LỖI TẢI DANH SÁCH RESIDENT:', err); 
          this.snackBar.open('Lỗi không xác định khi tải dữ liệu. Kiểm tra console.', 'Đóng', { duration: 5000 });
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
  
  // --- Logic Chuyển đổi Trạng thái ---
  toggleStatus(user: UserAccountDto): void {
    // FIX: Dùng .toLowerCase() để kiểm tra trạng thái hiện tại
    const isCurrentlyActive = user.status.toLowerCase() === 'active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active'; // Gửi Active/Inactive lên server

    if (!confirm(`Bạn có chắc chắn muốn ${newStatus === 'Active' ? 'KÍCH HOẠT' : 'VÔ HIỆU HÓA'} tài khoản ${user.name} không?`)) {
        return;
    }
    
    this.isLoading = true;
    
    // Gửi trạng thái mới (Active/Inactive) lên server
    this.userService.toggleUserStatus(user.userId, { status: newStatus as 'Active' | 'Inactive' })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            // FIX: Cập nhật UI bằng giá trị đã được chuẩn hóa (chữ thường)
            user.status = newStatus.toLowerCase(); 
            this.snackBar.open(response.message || `Cập nhật trạng thái thành công.`, 'Đóng', { duration: 3000 });
          } else {
            this.snackBar.open(response.message || 'Cập nhật trạng thái thất bại.', 'Đóng', { duration: 3000 });
          }
        },
        error: (err) => {
          this.snackBar.open('Lỗi kết nối máy chủ khi cập nhật trạng thái.', 'Đóng', { duration: 3000 });
        }
      });
}
}