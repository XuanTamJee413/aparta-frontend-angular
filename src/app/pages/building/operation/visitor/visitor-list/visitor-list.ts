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

export type VisitorAction = 'checkin' | 'checkout' | 'reject';

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


  isConfirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmActionType: VisitorAction | null = null;
  pendingActionLog: VisitLogStaffViewDto | null = null;
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
    // Đổi getAllVisitors thành getStaffVisitLogs
    this.visitorService.getStaffVisitLogs(this.queryParams).subscribe({
      next: (data) => {
        // 'data' ở đây đã được pipe(map(res => res.data)) trong Service nên nó là PagedList
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
    // Đảm bảo getAllApartments() trả về Observable<ApartmentDto[]>
    this.visitorService.getAllApartments().subscribe({
      next: (data) => {
        // Kiểm tra nếu data là mảng trực tiếp (do Service đã map qua response.data)
        this.apartmentList = data.sort((a, b) => a.code.localeCompare(b.code));
      },
      error: (err) => {
        console.error('Lỗi tải danh sách căn hộ', err);
        // Có thể Backend yêu cầu buildingId hoặc quyền cụ thể
        this.showAlert('Không thể tải danh sách căn hộ', 'danger');
      }
    });
  }
  // Trong class VisitorList
  onSearchInput(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm); // Gửi giá trị vào Subject để debounce (tránh gọi API liên tục)
  }
  // Cập nhật sự kiện change cho MatSelect
  onApartmentFilterChange(apartmentId: string): void {
    this.queryParams.apartmentId = apartmentId;
    this.queryParams.pageNumber = 1;
    this.loadAllVisitors();
  }

  // Cập nhật sort cho MatSort header
  onSortChange(sortState: { active: string, direction: string }): void {
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
  if (visitor.status === 'Checked-in' || visitor.status === 'Checked-out' || visitor.status === 'Cancelled' || visitor.status === 'Rejected') {
    return;
  }

  this.visitorService.checkInVisitor(visitor.visitLogId).subscribe({
    next: (response) => {
      if (response.succeeded) {
        this.showAlert(response.message || `Đã check-in cho khách: ${visitor.visitorFullName}`, 'success');
        this.loadAllVisitors();
      } else {
        this.showAlert(response.message || 'Lỗi: Không thể check-in', 'danger');
        this.loadAllVisitors(); // Tải lại ngay cả khi succeeded = false
      }
    },
    error: (err) => {
      // Lấy thông báo lỗi chi tiết từ Backend (ValidationException)
      const errorMessage = err?.error?.message || 'Lỗi máy chủ: Không thể check-in';
      this.showAlert(errorMessage, 'danger');
      
      // TẢI LẠI DỮ LIỆU MỚI NHẤT ĐỂ ĐỒNG BỘ NÚT BẤM
      this.loadAllVisitors();
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
        this.loadAllVisitors();
      }
    },
    error: (err) => {
      const errorMessage = err?.error?.message || 'Lỗi máy chủ: Không thể check-out';
      this.showAlert(errorMessage, 'danger');
      
      // ĐỒNG BỘ LẠI TRẠNG THÁI TRÊN MÀN HÌNH
      this.loadAllVisitors();
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
  // Thay thế hàm getStatusColor cũ bằng hàm này
  getStatusClass(status: string): string {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'checked-in': return 'status-checkin';
      case 'pending': return 'status-pending';
      case 'cancelled': // Khớp với enum Backend
      case 'rejected':  // Khớp với enum Backend
        return 'status-cancelled'; // Màu đỏ/vàng cảnh báo
      case 'checked-out': return 'status-checkout';
      default: return '';
    }
  }

  openConfirmPopup(type: VisitorAction, log: VisitLogStaffViewDto): void {
    this.pendingActionLog = log;
    this.confirmActionType = type;
    this.isConfirmVisible = true;

    // Cấu hình nội dung Popup dựa trên loại hành động
    const config = {
      checkin: {
        title: 'Xác nhận Check-in',
        message: `Check-in cho khách: ${log.visitorFullName}?`
      },
      checkout: {
        title: 'Xác nhận Check-out',
        message: `Check-out cho khách: ${log.visitorFullName}?`
      },
      reject: {
        title: 'Từ chối truy cập',
        message: `Bạn chắc chắn muốn từ chối yêu cầu của khách ${log.visitorFullName}?`
      }
    };

    const selectedConfig = config[type];
    this.confirmTitle = selectedConfig.title;
    this.confirmMessage = selectedConfig.message;
  }

  /**
   * Thực thi API sau khi người dùng bấm nút "Xác nhận" trên Popup
   */
 executeConfirmAction(): void {
  if (!this.pendingActionLog || !this.confirmActionType) return;

  const log = this.pendingActionLog;
  const action = this.confirmActionType;
  this.isConfirmVisible = false;

  if (action === 'checkin') {
    this.onCheckIn(log);
  } else if (action === 'checkout') {
    this.onCheckOut(log);
  } else if (action === 'reject') {
    this.visitorService.rejectVisitor(log.visitLogId).subscribe({
      next: (response) => {
        this.showAlert(response?.message || 'Đã từ chối yêu cầu khách thăm', 'success');
        this.loadAllVisitors();
      },
      error: (err) => {
        // Hiển thị lỗi như: "Yêu cầu này đã được từ chối bởi nhân viên khác"
        const errorMessage = err?.error?.message || 'Lỗi: Không thể từ chối';
        this.showAlert(errorMessage, 'danger');
        
        // TẢI LẠI TRANG ĐỂ CẬP NHẬT TRẠNG THÁI MỚI NHẤT
        this.loadAllVisitors();
      }
    });
  }

  this.pendingActionLog = null;
  this.confirmActionType = null;
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