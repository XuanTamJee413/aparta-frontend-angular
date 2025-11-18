import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Manager } from '../../../../models/manager.model';
import { ManagerService } from '../../../../services/admin/manager.service';

@Component({
  selector: 'app-manager-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manager-list.html',
  styleUrls: ['./manager-list.css']
})
export class ManagerListComponent implements OnInit {
  managers: Manager[] = [];
  filteredManagers: Manager[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadManagers();
  }

  loadManagers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.managerService.getAllManagers(this.searchTerm).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.managers = response.data as Manager[];
          this.filteredManagers = [...this.managers];
          this.updatePagination();
        } else {
          this.errorMessage = response.message || 'Failed to load managers';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading managers';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadManagers();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadManagers();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredManagers.length / this.itemsPerPage);
  }

  get paginatedManagers(): Manager[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredManagers.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
