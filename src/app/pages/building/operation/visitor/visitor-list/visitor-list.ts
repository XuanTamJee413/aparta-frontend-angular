import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// --- ANGULAR MATERIAL IMPORTS ---
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { 
  VisitorService, 
  VisitLogStaffViewDto, 
  ApartmentDto, 
  VisitorQueryParams 
} from '../../../../../services/resident/visitor.service';

import { FastCheckin } from '../fast-checkin/fast-checkin'; 

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FastCheckin,
    // Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './visitor-list.html',
  styleUrl: './visitor-list.css'
})
export class VisitorList implements OnInit {

  isLoading = false;
  showFastCheckin = false; 

  isModalVisible = false;
  selectedVisitor: VisitLogStaffViewDto | null = null;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';
  private alertTimeout: any;

  apartmentList: ApartmentDto[] = []; 
  
  // Dữ liệu bảng
  paginatedVisitors: any | null = null;
  
  // --- UI CONFIG CHO MAT-TABLE ---
  // Định nghĩa các cột sẽ hiển thị
  displayedColumns: string[] = ['visitorInfo', 'checkinTime', 'status', 'actions'];

  queryParams: VisitorQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    apartmentId: '', 
    searchTerm: '',
    sortColumn: 'checkinTime',
    sortDirection: 'desc'
  };
  
  private searchSubject = new Subject<string>();

  constructor(
    private visitorService: VisitorService
  ) { }

  ngOnInit(): void {
    this.loadAllVisitors();
    this.loadApartments(); 

    this.searchSubject.pipe(
      debounceTime(500), 
      distinctUntilChanged() 
    ).subscribe(searchTerm => {
      this.queryParams.searchTerm = searchTerm;
      this.queryParams.pageNumber = 1;
      this.loadAllVisitors();
    });
  }

  loadAllVisitors(): void {
    this.isLoading = true;
    this.visitorService.getAllVisitors(this.queryParams).subscribe({
      next: (data) => {
        const processedItems = data.items.map(log => {
          let checkinTimeStr = (log as any).checkinTime;
          let checkoutTimeStr = (log as any).checkoutTime;

          if (typeof checkinTimeStr === 'string' && !checkinTimeStr.endsWith('Z')) {
            checkinTimeStr += 'Z';
          }
          if (typeof checkoutTimeStr === 'string' && !checkoutTimeStr.endsWith('Z')) {
            checkoutTimeStr += 'Z';
          }

          return {
            ...log,
            checkinTime: new Date(checkinTimeStr),
            checkoutTime: checkoutTimeStr ? new Date(checkoutTimeStr) : null
          };
        });
        
        this.paginatedVisitors = {
          ...data, 
          items: processedItems 
        };
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading all visitors', err);
        this.showAlert('Không thể tải danh sách khách thăm', 'danger');
        this.isLoading = false;
      }
    });
  }

  loadApartments(): void {
    this.visitorService.getAllApartments().subscribe({
      next: (data) => {
        this.apartmentList = data.sort((a, b) => a.code.localeCompare(b.code));
      },
      error: (err) => {
        console.error('Lỗi tải danh sách căn hộ', err);
        this.showAlert('Không thể tải danh sách căn hộ', 'danger');
      }
    });
  }

  onSearchInput(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  // Cập nhật sự kiện change cho MatSelect
  onApartmentFilterChange(apartmentId: string): void {
    this.queryParams.apartmentId = apartmentId;
    this.queryParams.pageNumber = 1; 
    this.loadAllVisitors();
  }

  // Cập nhật sort cho MatSort header
  onSortChange(sortState: {active: string, direction: string}): void {
    // MatSort direction trả về '' hoặc 'asc' hoặc 'desc'
    if (sortState.direction) {
        this.queryParams.sortColumn = sortState.active;
        this.queryParams.sortDirection = sortState.direction;
    } else {
        // Mặc định
        this.queryParams.sortColumn = 'checkinTime';
        this.queryParams.sortDirection = 'desc';
    }
    this.queryParams.pageNumber = 1;
    this.loadAllVisitors();
  }

  // Cập nhật phân trang cho MatPaginator
  onMatPageChange(event: PageEvent): void {
    this.queryParams.pageSize = event.pageSize;
    this.queryParams.pageNumber = event.pageIndex + 1; // MatPaginator index bắt đầu từ 0
    this.loadAllVisitors();
  }

  openVisitorDetails(visitor: VisitLogStaffViewDto): void {
    this.selectedVisitor = visitor;
    this.isModalVisible = true;
  }

  closeVisitorDetails(): void {
    this.isModalVisible = false;
    this.selectedVisitor = null;
  }

  onCheckIn(visitor: VisitLogStaffViewDto): void {
    if (visitor.status === 'Checked-in' || visitor.status === 'Checked-out' || visitor.status === 'Cancelled') {
      return;
    }

    this.visitorService.checkInVisitor(visitor.visitLogId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.showAlert(response.message || `Đã check-in cho khách: ${visitor.visitorFullName}`, 'success');
          this.loadAllVisitors(); 
        } else {
          this.showAlert(response.message || 'Lỗi: Không thể check-in', 'danger');
        }
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Lỗi máy chủ: Không thể check-in', 'danger');
        console.error(err);
      }
    });
  }

  onCheckOut(visitor: VisitLogStaffViewDto): void {
    if (visitor.status !== 'Checked-in') {
      return;
    }

    this.visitorService.checkOutVisitor(visitor.visitLogId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.showAlert(response.message || `Đã check-out cho khách: ${visitor.visitorFullName}`, 'success');
          this.loadAllVisitors(); 
        } else {
          this.showAlert(response.message || 'Lỗi: Không thể check-out', 'danger');
        }
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Lỗi máy chủ: Không thể check-out', 'danger');
        console.error(err);
      }
    });
  }

  onFastCheckinSuccess(visitorName: string): void {
    this.showAlert(`Đã tạo và check-in khách: ${visitorName}`, 'success');
    this.showFastCheckin = false;
    this.loadAllVisitors(); 
  }

  onFastCheckinClose(): void {
    this.showFastCheckin = false;
  }

  // Helper cho màu sắc chip
  getStatusColor(status: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (status.toLowerCase()) {
      case 'checked-in': return 'primary'; // Xanh
      case 'pending': return 'accent'; // Vàng/Cam (tùy theme)
      case 'cancelled': return 'warn'; // Đỏ
      case 'checked-out': return undefined; // Xám mặc định
      default: return undefined;
    }
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    this.alertTimeout = setTimeout(() => {
      this.alertMessage = null;
    }, 3000);
  }
}