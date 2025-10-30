import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../../../../services/operation/vehicle.service';

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}
export interface VehicleQueryParameters {
  status: string | null;
  searchTerm: string | null;
  sortBy: string | null;
  sortOrder: string | null;
}
export interface Apartment {
  apartmentId: string;
  code: string;
}
export interface Vehicle {
  vehicleId: string;
  apartmentId: string;
  vehicleNumber: string;
  info: string | null;
  status: string;
  createdAt: string | null;
  apartmentCode?: string;
}
export interface VehicleUpdateDto {
  vehicleNumber?: string;
  info?: string;
  status?: string;
}

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterLink
  ],

  template: `
    <div class="container">
      <div class="card">
        <header>
          <h1>Quản lý Phương tiện</h1>
          <p>Danh sách phương tiện đã đăng ký trong hệ thống:</p>
        </header>

        <div class="filter-container">
          <div class="search-wrapper">
            <div class="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              class="search-input"
              placeholder="Tìm theo biển số, căn hộ, loại xe..."
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
            />
          </div>
          <div class="filter-wrapper">
            <select class="filter-select" [(ngModel)]="selectedStatus" (change)="onFilterChange()">
              <option [ngValue]="null">Tất cả trạng thái</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Bị từ chối">Bị từ chối</option>
            </select>
          </div>
        </div>

        @if (isLoading) {
          <div class="text-center" style="padding: 2rem;">
            <p>Đang tải dữ liệu...</p>
          </div>
        } @else if (error) {
          <div class="alert alert-danger" style="margin-top: 1.5rem;">
            {{ error }}
          </div>
        } @else {
          <div class="table-container">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Căn hộ</th>
                    <th>Loại xe</th>
                    <th class="sortable-header" (click)="toggleSort('vehicleNumber')">
                      <div class="sort-header-content">
                        <span>Biển số</span>
                        <span class="sort-icon">
                          @if (query.sortBy === 'vehicleNumber') {
                            @if (query.sortOrder === 'asc') {
                              <svg class="sort-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                            } @else {
                              <svg class="sort-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            }
                          } @else {
                            <svg class="sort-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /></svg>
                          }
                        </span>
                      </div>
                    </th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  @for (vehicle of vehicles; track vehicle.vehicleId) {
                    <tr>
                      <td>{{ vehicle.apartmentCode }}</td>
                      <td>{{ vehicle.info }}</td>
                      <td class="font-medium">{{ vehicle.vehicleNumber }}</td>
                      <td>{{ vehicle.createdAt | date: 'dd/MM/yyyy' }}</td>
                      <td>
                        @if (editingVehicleId === vehicle.vehicleId) {
                          <select [(ngModel)]="tempStatus" class="form-select-sm">
                            @for (status of statuses; track status) {
                              <option [value]="status">{{ status }}</option>
                            }
                          </select>
                        } @else {
                          @if (vehicle.status === 'Đã duyệt') {
                            <span class="status-approved">Đã duyệt</span>
                          } @else if (vehicle.status === 'Chờ duyệt') {
                            <span class="status-pending">Chờ duyệt</span>
                          } @else {
                            <span class="status-rejected">Bị từ chối</span>
                          }
                        }
                        </td>
                      <td class="actions">
                        @if (editingVehicleId === vehicle.vehicleId) {
                          <button class="action-save-btn" (click)="onSave(vehicle)">Lưu</button>
                          <button class="action-cancel-btn" (click)="onCancel()">Hủy</button>
                        } @else {
                          <button class="action-edit-btn" (click)="onEdit(vehicle)">
                            <svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                            Sửa
                          </button>
                        }
                        </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="no-results">
                        Không tìm thấy phương tiện nào phù hợp.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="pagination" *ngIf="totalPages > 1">
            <span class="page-info">
              Trang <span class="font-medium">{{ currentPage }}</span> / <span class="font-medium">{{ totalPages }}</span>
            </span>
            <div class="pagination-buttons">
              <button class="pagination-btn" [disabled]="currentPage === 1" (click)="previousPage()">
                Trước
              </button>
              <button class="pagination-btn" [disabled]="currentPage === totalPages" (click)="nextPage()">
                Tiếp
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,

  styles: [
    `
    :host {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }
    .container {
        padding: 2rem;
    }
    .card {
        max-width: 1280px;
        margin: 0 auto;
        background-color: white;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        padding: 2rem;
    }
    header h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
    }
    header p {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #6b7280;
    }
    .filter-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
      align-items: center;
    }
    .search-wrapper {
      flex-grow: 1;
      min-width: 250px;
      position: relative;
    }
    .filter-wrapper {
      position: relative;
    }
    .filter-select {
      display: block;
      width: 100%;
      min-width: 200px;
      padding-left: 0.75rem;
      padding-right: 2.5rem;
      padding-top: 0.625rem;
      padding-bottom: 0.625rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      background-color: white;
      color: #111827;
      box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      cursor: pointer;
    }
    .form-select-sm {
      font-size: 0.875rem;
      padding: 0.25rem 1.5rem 0.25rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.25rem center;
      background-repeat: no-repeat;
      background-size: 1.25em 1.25em;
      appearance: none;
    }
    .filter-select:focus, .form-select-sm:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 1px #4f46e5;
    }
    .search-icon {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        padding-left: 0.75rem;
        display: flex;
        align-items: center;
        pointer-events: none;
    }
    .search-icon svg {
        height: 1.25rem;
        width: 1.25rem;
        color: #9ca3af;
    }
    .search-input {
        display: block;
        width: 100%;
        padding-left: 2.5rem;
        padding-right: 0.75rem;
        padding-top: 0.625rem;
        padding-bottom: 0.625rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background-color: white;
        color: #111827;
        box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .search-input::placeholder {
       color: #9ca3af;
    }
    .search-input:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 1px #4f46e5;
    }
    .table-container {
        overflow-x: auto;
    }
    .table-wrapper {
        min-width: 100%;
        border-radius: 0.5rem;
        overflow: hidden;
        border: 1px solid #e5e7eb;
    }
    .data-table {
        min-width: 100%;
        border-collapse: collapse;
    }
    .data-table thead {
        background-color: #f9fafb;
    }
    .data-table th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 600;
        color: #4b5563;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e5e7eb;
    }
    .sortable-header {
      cursor: pointer;
      user-select: none;
    }
    .sortable-header:hover {
      background-color: #f3f4f6;
    }
    .sort-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sort-icon {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      color: #9ca3af;
      margin-left: 0.25rem;
    }
    .sortable-header:hover .sort-icon {
      color: #374151;
    }
    .sort-svg {
      width: 1rem;
      height: 1rem;
    }
    .data-table tbody {
        background-color: white;
    }
    .data-table tbody tr:not(:last-child) {
      border-bottom: 1px solid #f3f4f6;
    }
    .data-table td {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #374151;
        white-space: nowrap;
    }
     .data-table tbody tr:hover {
       background-color: #f9fafb;
     }
    .data-table td.font-medium {
        font-weight: 500;
        color: #111827;
    }

    .status-approved {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #065f46;
      background-color: #d1fae5;
      border-radius: 9999px;
    }
    .status-pending {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #92400e;
      background-color: #fef3c7;
      border-radius: 9999px;
    }
    .status-rejected {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #991b1b;
      background-color: #fee2e2;
      border-radius: 9999px;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .action-view {
        color: #4f46e5;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        font-weight: 500;
    }
    .action-view:hover {
        color: #4338ca;
    }
    .action-icon {
        height: 1rem;
        width: 1rem;
        margin-right: 0.25rem;
    }
    .action-edit-btn {
        background-color: transparent;
        color: #4f46e5;
        font-weight: 500;
        padding: 0;
        border: none;
        border-radius: 0;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
    }
     .action-edit-btn:hover {
       color: #4338ca;
     }
    .action-save-btn, .action-cancel-btn {
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    .action-save-btn {
      color: #fff;
      background-color: #10b981;
    }
    .action-save-btn:hover {
      background-color: #059669;
    }
    .action-cancel-btn {
      color: #374151;
      background-color: #e5e7eb;
    }
    .action-cancel-btn:hover {
      background-color: #d1d5db;
    }

    .no-results {
        text-align: center;
        padding: 2.5rem;
        color: #6b7280;
    }
    .pagination {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .page-info {
        font-size: 0.875rem;
        color: #374151;
    }
    .page-info .font-medium {
        font-weight: 500;
    }
    .pagination-buttons {
        display: flex;
        align-items: center;
    }
    .pagination-btn {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        background-color: white;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.15s ease-in-out;
    }
    .pagination-btn:hover:not(:disabled) {
        background-color: #f9fafb;
    }
    .pagination-btn:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
    .pagination-buttons button:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .pagination-buttons button:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      margin-left: -1px;
    }
    .alert.alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
      padding: 0.75rem 1.25rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
    }
  `
  ]
})

export class VehicleList implements OnInit {

  private allVehicles: Vehicle[] = [];
  vehicles: Vehicle[] = [];
  isLoading = true;
  error: string | null = null;
  searchTerm: string = '';
  selectedStatus: string | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  public query: VehicleQueryParameters = {
    status: null,
    searchTerm: null,
    sortBy: 'vehicleNumber',
    sortOrder: 'asc'
  };
  private searchDebouncer = new Subject<string>();
  editingVehicleId: string | null = null;
  tempStatus: string = '';
  readonly statuses: string[] = ['Chờ duyệt', 'Đã duyệt', 'Bị từ chối'];

  private apartmentNameMap = new Map<string, string>();

  constructor(private vehicleService: VehicleService) { }

  ngOnInit(): void {
    this.loadInitialData();
    this.searchDebouncer.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadVehicles();
    });
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = null;
    this.editingVehicleId = null;

    this.vehicleService.getApartments().subscribe({
      next: (aptResponse) => {
        if (aptResponse.succeeded) {
          aptResponse.data.forEach(apt => {
            this.apartmentNameMap.set(apt.apartmentId, apt.code);
          });
        }
        this.loadVehicles();
      },
      error: (err) => {
        this.error = 'Không thể tải được dữ liệu Căn hộ. Vui lòng thử lại.';
        this.isLoading = false;
        console.error('Lỗi khi gọi API Căn hộ:', err);
      }
    });
  }

  loadVehicles(): void {
    if (!this.apartmentNameMap.size) {
      this.isLoading = true;
    }
    this.error = null;
    this.editingVehicleId = null;

    this.query.searchTerm = this.searchTerm || null;
    this.query.status = this.selectedStatus;

    this.vehicleService.getVehicles(this.query).subscribe({
      next: (vehicleResponse: ApiResponse<Vehicle[]>) => {
        if (vehicleResponse.succeeded) {
          vehicleResponse.data.forEach(vehicle => {
            vehicle.apartmentCode = this.apartmentNameMap.get(vehicle.apartmentId) || vehicle.apartmentId;
          });
          this.allVehicles = vehicleResponse.data;
        } else {
          this.allVehicles = [];
          if (vehicleResponse.message !== 'SM01') {
            this.error = vehicleResponse.message;
          }
        }

        this.applyPagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải được danh sách phương tiện. Vui lòng thử lại.';
        this.isLoading = false;
        this.allVehicles = [];
        this.applyPagination();
        console.error('Lỗi khi gọi API Phương tiện:', err);
      }
    });
  }

  applyPagination(): void {
    this.totalPages = Math.ceil(this.allVehicles.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.vehicles = this.allVehicles.slice(startIndex, endIndex);


  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.searchDebouncer.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadVehicles();
  }

  toggleSort(column: string): void {
    if (this.query.sortBy === column) {
      this.query.sortOrder = this.query.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.query.sortBy = column;
      this.query.sortOrder = 'asc';
    }
    this.currentPage = 1;
    this.loadVehicles();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  onEdit(vehicle: Vehicle): void {
    this.editingVehicleId = vehicle.vehicleId;
    this.tempStatus = vehicle.status;
  }

  onCancel(): void {
    this.editingVehicleId = null;
    this.tempStatus = '';
  }

  onSave(vehicle: Vehicle): void {
    vehicle.status = this.tempStatus;
    const updateDto: VehicleUpdateDto = {
      status: vehicle.status
    };

    this.vehicleService.updateVehicle(vehicle.vehicleId, updateDto).subscribe({
      next: (response) => {
        console.log('Cập nhật thành công!', response);
        const index = this.allVehicles.findIndex(v => v.vehicleId === vehicle.vehicleId);
        if (index !== -1) {
          this.allVehicles[index].status = vehicle.status;
        }
        this.applyPagination();
        this.editingVehicleId = null;
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật:', err);
        this.loadInitialData();
      }
    });
  }
}
