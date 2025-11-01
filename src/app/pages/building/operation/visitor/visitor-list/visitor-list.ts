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

// Import component con (tên file theo cấu trúc của bạn)
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

  // --- Trạng thái UI ---
  isLoading = false;
  showFastCheckin = false; // Ẩn/hiện form check-in nhanh

  // --- Trạng thái Modal & Alert ---
  isModalVisible = false;
  selectedVisitor: VisitLogStaffViewDto | null = null;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';
  private alertTimeout: any;

  // --- Dữ liệu ---
  apartmentList: ApartmentDto[] = []; // Danh sách căn hộ (mock)
  paginatedVisitors: PagedList<VisitLogStaffViewDto> | null = null; // Dữ liệu phân trang
  
  // --- Quản lý Query & Phân trang ---
  queryParams: VisitorQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    apartmentId: '', 
    searchTerm: '',
    sortColumn: 'checkinTime',
    sortDirection: 'desc'
  };
  
  // Subject để debounce (trì hoãn) việc tìm kiếm khi gõ phím
  private searchSubject = new Subject<string>();

  // Dữ liệu apartmentList sẽ được lấy từ API
  // --- Constructor ---
  constructor(
    private visitorService: VisitorService
  ) { }

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    this.loadAllVisitors();
    this.loadApartments(); // Tải danh sách căn hộ (mock)

    // Cấu hình debounce cho search input
    this.searchSubject.pipe(
      debounceTime(500), // Chờ 500ms sau khi ngừng gõ
      distinctUntilChanged() // Chỉ tìm khi giá trị thay đổi
    ).subscribe(searchTerm => {
      this.queryParams.searchTerm = searchTerm;
      this.queryParams.pageNumber = 1; // Reset về trang 1
      this.loadAllVisitors();
    });
  }

  // --- Tải Dữ liệu ---

  /** Tải danh sách khách thăm từ API theo queryParams hiện tại */
  loadAllVisitors(): void {
    this.isLoading = true;
    this.visitorService.getAllVisitors(this.queryParams).subscribe({
      next: (data) => {
        this.paginatedVisitors = data; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading all visitors', err);
        this.showAlert('Không thể tải danh sách khách thăm', 'danger');
        this.isLoading = false;
      }
    });
  }

  /** Tải danh sách căn hộ (hiện đang dùng dữ liệu mock) */
  loadApartments(): void {
    // Gọi service để lấy dữ liệu thật
    this.visitorService.getAllApartments().subscribe({
      next: (data) => {
        // Sắp xếp theo mã căn hộ (code) trước khi gán
        this.apartmentList = data.sort((a, b) => a.code.localeCompare(b.code));
      },
      error: (err) => {
        console.error('Lỗi tải danh sách căn hộ', err);
        this.showAlert('Không thể tải danh sách căn hộ', 'danger');
      }
    });
  }

  // --- Xử lý Sự kiện UI (Filter, Sort, Page) ---

  /** Được gọi khi gõ vào ô tìm kiếm */
  onSearchInput(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  /** Được gọi khi chọn căn hộ từ combobox */
  onApartmentFilterChange(event: Event): void {
    const apartmentId = (event.target as HTMLSelectElement).value;
    this.queryParams.apartmentId = apartmentId;
    this.queryParams.pageNumber = 1; 
    this.loadAllVisitors();
  }

  /** Được gọi khi click vào tiêu đề cột để sắp xếp */
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

  /** Được gọi khi click vào nút phân trang */
  onPageChange(pageNumber: number): void {
    if (pageNumber < 1 || (this.paginatedVisitors && pageNumber > this.paginatedVisitors.totalPages) || pageNumber === this.queryParams.pageNumber) {
      return; 
    }
    this.queryParams.pageNumber = pageNumber;
    this.loadAllVisitors();
  }

  // --- Xử lý Hành động (Check-in/out, Modal) ---

  /** Mở modal chi tiết khách thăm */
  openVisitorDetails(visitor: VisitLogStaffViewDto): void {
    this.selectedVisitor = visitor;
    this.isModalVisible = true;
  }

  /** Đóng modal chi tiết khách thăm */
  closeVisitorDetails(): void {
    this.isModalVisible = false;
    this.selectedVisitor = null;
  }

  /** Xử lý khi nhấn nút Check-in */
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

  /** Xử lý khi nhấn nút Check-out */
  onCheckOut(visitor: VisitLogStaffViewDto): void {
    if (visitor.status !== 'Checked-in') {
      return;
    }

    this.visitorService.checkOutVisitor(visitor.visitLogId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.showAlert(response.message || `Đã check-out cho khách: ${visitor.visitorFullName}`, 'success');
          this.loadAllVisitors(); // Tải lại danh sách
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

  // --- Xử lý sự kiện từ Component con (FastCheckin) ---

  /** Xử lý khi check-in nhanh thành công */
  onFastCheckinSuccess(visitorName: string): void {
    this.showAlert(`Đã tạo và check-in khách: ${visitorName}`, 'success');
    this.showFastCheckin = false;
    this.loadAllVisitors(); 
  }

  /** Xử lý khi đóng form check-in nhanh */
  onFastCheckinClose(): void {
    this.showFastCheckin = false;
  }

  // --- Helpers ---

  /** Lấy class màu cho badge trạng thái */
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

  /** Hiển thị thông báo (alert) */
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

  /** Helper tạo mảng số trang [1, 2, 3...] cho UI */
  getPaginationArray(): number[] {
    if (!this.paginatedVisitors) return [];
    return Array(this.paginatedVisitors.totalPages).fill(0).map((x, i) => i + 1);
  }
}