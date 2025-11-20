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

  public sortBy: 'startDate' | 'endDate' | null = null;
  public sortOrder: 'asc' | 'desc' = 'desc';

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

  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

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

  onSort(field: 'startDate' | 'endDate'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }

    this.loadContracts();
  }

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


  onAdd(): void {
    this.router.navigate(['/manager/manage-contract/create']);
  }

  onView(id: string): void {
    this.router.navigate(['/manager/manage-contract/detail', id]);
  }

  onEdit(id: string): void {
    this.router.navigate(['/manager/manage-contract/edit', id]);
  }


  isHistorical(contract: ContractDto): boolean {
    const code = contract.apartmentCode ?? '';
    return code.toUpperCase().includes('HIS');
  }

  canDelete(contract: ContractDto): boolean {
    if (!contract.endDate) return false;

    const endDate = new Date(contract.endDate);
    if (isNaN(endDate.getTime())) return false;

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return endOnly <= todayOnly;
  }

  onDelete(id: string): void {
    const contract = this.allContracts.find(c => c.contractId === id);
    if (!contract) return;

    if (this.isHistorical(contract)) {
      alert('Hợp đồng này đã được xử lý trước đó, không thể xóa thêm.');
      return;
    }

    if (!this.canDelete(contract)) {
      alert('Hợp đồng chưa hết hạn, không được phép xóa.');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa hợp đồng này không?`)) {
      this.isLoading = true;
      this.contractService.deleteContract(id).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Xóa hợp đồng thành công.');
          this.loadContracts();
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.message || 'Không thể xóa hợp đồng.';
          alert(msg);
          console.error('Lỗi khi xóa:', err);
        }
      });
    }
  }
}
