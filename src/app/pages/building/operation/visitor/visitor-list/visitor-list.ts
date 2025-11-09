import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { 
  VisitorService, 
  VisitLogStaffViewDto, 
  ApartmentDto, 
  PagedList, 
  VisitorQueryParams 
} from '../../../../../services/resident/visitor.service';

import { FastCheckin } from '../fast-checkin/fast-checkin'; 

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FastCheckin
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
  
  // SỬA LỖI 1: Thay đổi kiểu PagedList<...> thành 'any' 
  // để cho phép chúng ta thay đổi kiểu dữ liệu của 'checkinTime' (string -> Date)
  paginatedVisitors: any | null = null;
  
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
        
        // --- SỬA LỖI 2: XỬ LÝ MÚI GIỜ ---
        // Map qua mảng 'items' để xử lý chuỗi thời gian
        const processedItems = data.items.map(log => {
          let checkinTimeStr = (log as any).checkinTime;
          let checkoutTimeStr = (log as any).checkoutTime;

          // Xử lý Check-in Time (thêm 'Z' nếu thiếu)
          if (typeof checkinTimeStr === 'string' && !checkinTimeStr.endsWith('Z')) {
            checkinTimeStr += 'Z';
          }
          
          // Xử lý Check-out Time (thêm 'Z' nếu thiếu và nếu tồn tại)
          if (typeof checkoutTimeStr === 'string' && !checkoutTimeStr.endsWith('Z')) {
            checkoutTimeStr += 'Z';
          }

          // Trả về object mới với Date objects
          // DatePipe trong HTML sẽ tự động chuyển Date object này sang giờ local
          return {
            ...log,
            checkinTime: new Date(checkinTimeStr),
            checkoutTime: checkoutTimeStr ? new Date(checkoutTimeStr) : null
          };
        });
        
        // Gán lại PagedList với 'items' đã được xử lý
        this.paginatedVisitors = {
          ...data, // Giữ lại totalCount, totalPages, v.v.
          items: processedItems // Ghi đè 'items' bằng mảng mới
        };
        // --- KẾT THÚC SỬA LỖI ---
        
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

  onApartmentFilterChange(event: Event): void {
    const apartmentId = (event.target as HTMLSelectElement).value;
    this.queryParams.apartmentId = apartmentId;
    this.queryParams.pageNumber = 1; 
    this.loadAllVisitors();
  }

  onSort(columnName: string): void {
    if (this.queryParams.sortColumn === columnName) {
      this.queryParams.sortDirection = this.queryParams.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.queryParams.sortColumn = columnName;
      this.queryParams.sortDirection = 'desc';
    }
    this.queryParams.pageNumber = 1;
    this.loadAllVisitors(); 
  }

  onPageChange(pageNumber: number): void {
    if (pageNumber < 1 || (this.paginatedVisitors && pageNumber > this.paginatedVisitors.totalPages) || pageNumber === this.queryParams.pageNumber) {
      return; 
    }
    this.queryParams.pageNumber = pageNumber;
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
          this.loadAllVisitors(); // Tải lại danh sách
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

  getStatusBadge(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-bg-warning';
      case 'checked-in':
        return 'text-bg-success';
      case 'checked-out':
        return 'text-bg-secondary';
      case 'cancelled':
        return 'text-bg-danger';
      default:
        return 'text-bg-light';
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

  getPaginationArray(): number[] {
    if (!this.paginatedVisitors) return [];
    return Array(this.paginatedVisitors.totalPages).fill(0).map((x, i) => i + 1);
  }
}