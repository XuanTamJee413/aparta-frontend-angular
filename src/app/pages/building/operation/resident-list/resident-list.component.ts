import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApartmentMember, ApartmentMemberQueryParameters, ResidentManagementService,ApiResponse } from '../../../../services/management/resident-management.service';



@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink, DatePipe],
  templateUrl: './resident-list.component.html',
  styleUrls: ['./resident-list.component.css']
})
export class ResidentList implements OnInit {
  private allMembers: ApartmentMember[] = [];
  members: ApartmentMember[] = [];

  isLoading = true;
  error: string | null = null;

  searchTerm: string = '';
  selectedOwnerStatus: boolean | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  public query: ApartmentMemberQueryParameters = {
    isOwned: null,
    searchTerm: null,
    sortBy: 'name',
    sortOrder: 'asc'
  };

  private searchDebouncer = new Subject<string>();

  constructor(private residentService: ResidentManagementService) {}

  ngOnInit(): void {
    this.loadMembers();
    this.searchDebouncer
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadMembers());
  }

  loadMembers(): void {
    this.isLoading = true;
    this.error = null;

    this.query.searchTerm = this.searchTerm || null;
    this.query.isOwned = this.selectedOwnerStatus;

    this.residentService.getMembers(this.query).subscribe({
      next: (response: ApiResponse<ApartmentMember[]>) => {
        if (response.succeeded) {
          this.allMembers = response.data;
        } else {
          this.allMembers = [];
          this.error = response.message === 'SM01'
            ? 'Không tìm thấy cư dân nào phù hợp.'
            : response.message;
        }
        this.applyPagination();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải được danh sách cư dân. Vui lòng thử lại.';
        this.isLoading = false;
        this.allMembers = [];
        this.applyPagination();
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }

  applyPagination(): void {
    this.totalPages = Math.ceil(this.allMembers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.members = this.allMembers.slice(startIndex, endIndex);

    if (this.allMembers.length === 0 && !this.isLoading && !this.error) {
      this.error = 'Không tìm thấy cư dân nào phù hợp.';
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.searchDebouncer.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadMembers();
  }

  toggleSort(column: string): void {
    if (this.query.sortBy === column) {
      this.query.sortOrder = this.query.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.query.sortBy = column;
      this.query.sortOrder = 'asc';
    }
    this.currentPage = 1;
    this.loadMembers();
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
}
