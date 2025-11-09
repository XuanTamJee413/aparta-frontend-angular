import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

import {
  ApartmentQueryParameters,
  ApartmentService,
  Apartment,
  BuildingOption
} from '../../../../../services/building/apartment.service';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './apartment-list.component.html',
  styleUrls: ['./apartment-list.component.css']
})
export class ApartmentList implements OnInit {

  private apartmentService = inject(ApartmentService);

  apartments = signal<Apartment[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  searchTerm: string = '';
  selectedStatus: string | null = null;
  selectedBuildingId: string | null = null;

  query: ApartmentQueryParameters = {
    searchTerm: null,
    sortBy: 'code',
    sortOrder: 'asc',
    status: null,
    buildingId: null
  };

  buildings = signal<BuildingOption[]>([]);
  buildingsLoading = signal(true);
  buildingsError = signal<string | null>(null);

  currentPage = signal(1);
  itemsPerPage = 10;
  totalPages = computed(() => Math.ceil(this.apartments().length / this.itemsPerPage));
  paginatedApartments = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.apartments().slice(startIndex, endIndex);
  });

  private searchDebouncer = new Subject<string>();

  ngOnInit(): void {
    this.loadBuildings();
    this.loadApartments();
    this.searchDebouncer.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadApartments());
  }

  loadBuildings(): void {
    this.buildingsLoading.set(true);
    this.buildingsError.set(null);
    this.apartmentService.getBuildings().subscribe({
      next: (list) => {
        this.buildings.set(list ?? []);
        this.buildingsLoading.set(false);
      },
      error: (err) => {
        console.error('Lỗi load buildings:', err);
        this.buildingsError.set('Không thể tải danh sách tòa nhà.');
        this.buildingsLoading.set(false);
      }
    });
  }

  loadApartments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.query.searchTerm = this.searchTerm || null;
    this.query.status = this.selectedStatus;
    this.query.buildingId = this.selectedBuildingId;

    this.apartmentService.getApartments(this.query).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.apartments.set(response.data ?? []);
        } else {
          this.apartments.set([]);
          if (response.message !== 'SM01') this.error.set(response.message);
        }
        this.isLoading.set(false);
        if (this.currentPage() > this.totalPages()) this.currentPage.set(1);
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách căn hộ. Vui lòng thử lại.');
        this.isLoading.set(false);
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.searchDebouncer.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadApartments();
  }

  toggleSort(column: 'code' | 'area' | 'type'): void {
    if (this.query.sortBy === column) {
      this.query.sortOrder = this.query.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.query.sortBy = column;
      this.query.sortOrder = 'asc';
    }
    this.currentPage.set(1);
    this.loadApartments();
  }

  previousPage(): void {
    if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1);
  }
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.set(this.currentPage() + 1);
  }
}
