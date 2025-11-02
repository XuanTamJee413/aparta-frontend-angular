import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuildingService, BuildingDto, BuildingQueryParameters, PaginatedResult } from '../../../../services/admin/building.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.css']
})
export class BuildingListComponent implements OnInit {
  buildings: BuildingDto[] = [];
  projects: ProjectDto[] = [];
  isLoading = false;
  errorMessage = '';
  isDeleting = false;
  
  // Sorting
  sortActiveFirst = true; // true: Active trước, false: Active sau

  // Client-side sorted view
  sortedBuildings(): BuildingDto[] {
    const list = [...this.buildings];
    return list.sort((a, b) => {
      if (a.isActive === b.isActive) {
        // Secondary by name for stable UX
        const an = (a.name || '').toLowerCase();
        const bn = (b.name || '').toLowerCase();
        if (an < bn) return -1;
        if (an > bn) return 1;
        return 0;
      }
      return this.sortActiveFirst
        ? (a.isActive ? -1 : 1)
        : (a.isActive ? 1 : -1);
    });
  }

  setActiveSort(first: boolean): void {
    this.sortActiveFirst = first;
  }

  // Search and pagination
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(
    private buildingService: BuildingService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadBuildings();
  }

  loadProjects(): void {
    this.projectService.getAllProjects({ isActive: true }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.projects = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  loadBuildings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const queryParams: BuildingQueryParameters = {
      searchTerm: this.searchTerm || undefined,
      skip: (this.currentPage - 1) * this.pageSize,
      take: this.pageSize
    };

    this.buildingService.getAllBuildings(queryParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded && response.data) {
          this.buildings = response.data.items;
          this.totalCount = response.data.totalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        } else {
          this.errorMessage = response.message || 'Không thể tải danh sách tòa nhà';
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || error.message || 'Lỗi khi tải danh sách tòa nhà';
        this.errorMessage = errorMessage;
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.error('Error loading buildings:', error);
      }
    });
  }

  searchBuildings(): void {
    this.currentPage = 1;
    this.loadBuildings();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadBuildings();
  }

  refreshBuildings(): void {
    this.loadBuildings();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadBuildings();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBuildings();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.projectId === projectId);
    return project ? project.name || project.projectCode || projectId : projectId;
  }

  deleteBuilding(building: BuildingDto): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa tòa nhà "${building.name}"?`)) {
      return;
    }

    this.isDeleting = true;
    this.buildingService.deleteBuilding(building.buildingId).subscribe({
      next: (response) => {
        this.isDeleting = false;
        if (response.succeeded) {
          this.snackBar.open(response.message || 'Xóa tòa nhà thành công', 'Đóng', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadBuildings(); // Reload the list
        } else {
          this.snackBar.open(response.message || 'Không thể xóa tòa nhà', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      },
      error: (error) => {
        this.isDeleting = false;
        const errorMessage = error.error?.message || error.message || 'Lỗi khi xóa tòa nhà';
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.error('Error deleting building:', error);
      }
    });
  }

  // Helper method for template
  Math = Math;
}