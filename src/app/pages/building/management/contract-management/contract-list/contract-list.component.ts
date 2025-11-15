import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  ContractDto,
  ContractManagementService,
  ContractQueryParameters
} from '../../../../../services/management/contract-management.service';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ContractList implements OnInit {

  public isLoading = false;
  public searchTerm = '';

  private allContracts: ContractDto[] = [];
  public filteredContracts: ContractDto[] = [];
  private searchSubject = new Subject<string>();

  // Sort
  public sortBy: 'startDate' | 'endDate' | null = null;
  public sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination (client-side)
  public pageSize = 10;
  public currentPage = 1;

  get totalItems(): number {
    return this.filteredContracts.length;
  }

  get totalPages(): number {
    if (this.totalItems === 0) return 1;
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pagedContracts(): ContractDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredContracts.slice(startIndex, startIndex + this.pageSize);
  }

  constructor(
    private contractService: ContractManagementService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadContracts();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filterContracts(term);
    });
  }

  /**
   * Tải danh sách hợp đồng từ service
   * Có truyền sortBy, sortOrder lên backend
   */
  loadContracts(): void {
    this.isLoading = true;

    const query: ContractQueryParameters = {
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.contractService.getContracts(query).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.allContracts = response.data;
          this.filteredContracts = response.data;

          // Nếu đang có từ khóa tìm kiếm thì filter lại
          if (this.searchTerm) {
            this.filterContracts(this.searchTerm);
          } else {
            this.currentPage = 1;
          }
        } else {
          this.allContracts = [];
          this.filteredContracts = [];
          this.currentPage = 1;
          console.error('Lỗi khi tải hợp đồng:', response.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi API:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Đẩy từ khóa tìm kiếm vào luồng (stream)
   */
  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  /**
   * Lọc danh sách hợp đồng dựa trên từ khóa
   */
  filterContracts(term: string): void {
    const lowerTerm = term.toLowerCase().trim();
    if (!lowerTerm) {
      this.filteredContracts = [...this.allContracts];
      this.currentPage = 1;
      return;
    }

    this.filteredContracts = this.allContracts.filter(contract => {
      const idMatch = contract.contractId.toLowerCase().includes(lowerTerm);

      const apartmentIdMatch = contract.apartmentId
        .toLowerCase()
        .includes(lowerTerm);

      const apartmentCodeMatch = contract.apartmentCode
        ? contract.apartmentCode.toLowerCase().includes(lowerTerm)
        : false;

      const nameMatch = contract.ownerName
        ? contract.ownerName.toLowerCase().includes(lowerTerm)
        : false;

      return idMatch || apartmentIdMatch || apartmentCodeMatch || nameMatch;
    });

    this.currentPage = 1;
  }

  /**
   * Sort theo startDate / endDate
   */
  onSort(field: 'startDate' | 'endDate'): void {
    if (this.sortBy === field) {
      // Toggle asc/desc
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }

    this.loadContracts();
  }

  // =========================
  // Pagination handlers
  // =========================

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  onPageSizeChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.pageSize = value;
    this.currentPage = 1;
  }

  //============================================
  // Xử lý hành động (Actions)
  //============================================

  onAdd(): void {
    this.router.navigate(['/quan-ly/hop-dong/them-moi']);
  }

  onView(id: string): void {
    this.router.navigate(['/quan-ly/hop-dong/chi-tiet', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/quan-ly/hop-dong/sua', id]);
  }

  onDelete(id: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa hợp đồng (ID: ${id}) không?`)) {
      this.isLoading = true;
      this.contractService.deleteContract(id).subscribe({
        next: () => {
          this.loadContracts();
          // TODO: Hiển thị toast "Xóa thành công"
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
          this.isLoading = false;
          // TODO: Hiển thị toast "Xóa thất bại"
        }
      });
    }
  }
}
