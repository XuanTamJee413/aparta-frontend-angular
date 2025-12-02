import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  VehicleService,
  Vehicle,
  VehicleUpdateDto,
  VehicleQueryParameters,
  ApiResponse,
  Apartment
} from '../../../../../services/operation/vehicle.service';

import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css']
})
export class VehicleList implements OnInit {
  private allVehicles: Vehicle[] = [];
  vehicles: Vehicle[] = [];
  isLoading = true;
  error: string | null = null;

  searchTerm = '';
  selectedStatus: string | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  public query: VehicleQueryParameters = {
    status: null,
    searchTerm: null,
    sortBy: 'vehicleNumber',
    sortOrder: 'asc'
  };

  private searchDebouncer = new Subject<string>();

  editingVehicleId: string | null = null;
  tempStatus = '';
  readonly statuses: string[] = ['Chờ duyệt', 'Đã duyệt', 'Bị từ chối'];

  private apartmentNameMap = new Map<string, string>();

  isManagerView = false;

  constructor(
    private vehicleService: VehicleService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {

    this.isManagerView =
      this.auth.hasRole('admin') ||

      this.auth.hasRole('custom');

    this.loadInitialData();

    this.searchDebouncer
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadVehicles();
      });
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = null;
    this.editingVehicleId = null;

    const apartment$ = this.isManagerView
      ? this.vehicleService.getApartments()
      : this.vehicleService.getMyApartments();

    apartment$.subscribe({
      next: (aptResponse) => {
        if (aptResponse.succeeded) {
          aptResponse.data.forEach((apt: Apartment) => {
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
    if (!this.apartmentNameMap.size) this.isLoading = true;

    this.error = null;
    this.editingVehicleId = null;

    this.query.searchTerm = this.searchTerm || null;
    this.query.status = this.selectedStatus;

    const vehicle$ = this.isManagerView
      ? this.vehicleService.getVehicles(this.query)
      : this.vehicleService.getMyVehicles(this.query);

    vehicle$.subscribe({
      next: (vehicleResponse: ApiResponse<Vehicle[]>) => {
        if (vehicleResponse.succeeded) {
          vehicleResponse.data.forEach((vehicle) => {
            vehicle.apartmentCode =
              this.apartmentNameMap.get(vehicle.apartmentId) || vehicle.apartmentId;
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
    const updateDto: VehicleUpdateDto = { status: vehicle.status };

    this.vehicleService.updateVehicle(vehicle.vehicleId, updateDto).subscribe({
      next: (response) => {
        console.log('Cập nhật thành công!', response);
        const index = this.allVehicles.findIndex((v) => v.vehicleId === vehicle.vehicleId);
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
