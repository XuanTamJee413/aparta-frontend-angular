import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService, ProjectDto, ProjectQueryParameters } from '../../../../services/admin/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  displayedColumns: string[] = ['projectCode', 'name', 'numApartments', 'numBuildings', 'isActive', 'createdAt', 'actions'];
  projects: ProjectDto[] = [];
  filteredProjects: ProjectDto[] = [];
  isLoading = false;
  
  // Filter properties
  searchTerm = '';
  isActiveFilter: boolean | null = null;
  sortBy = '';
  sortOrder = 'asc';

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    
    const query: ProjectQueryParameters = {
      searchTerm: this.searchTerm || undefined,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      sortBy: this.sortBy || undefined,
      sortOrder: this.sortOrder || undefined
    };

    this.projectService.getAllProjects(query).subscribe({
      next: (response: any) => {
        if (response.succeeded) {
          this.projects = response.data || [];
          this.filteredProjects = [...this.projects];
          
          // Hiển thị message từ backend nếu có (thường là thông báo thành công)
          if (response.message) {
            this.snackBar.open(response.message, 'Đóng', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }
        } else {
          // Hiển thị message từ backend hoặc message mặc định
          const errorMessage = response.message || 'Lỗi khi tải danh sách dự án';
          this.snackBar.open(errorMessage, 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        
        // Xử lý error response từ backend
        let errorMessage = 'Lỗi khi tải danh sách dự án';
        
        if (error.error && error.error.message) {
          // Nếu backend trả về error với message
          errorMessage = error.error.message;
        } else if (error.message) {
          // Nếu có message trong error object
          errorMessage = error.message;
        }
        
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  onCreateProject(): void {
    this.router.navigate(['/admin/project/create']);
  }

  onEditProject(project: ProjectDto): void {
    this.router.navigate(['/admin/project/edit', project.projectId]);
  }

  onSearch(): void {
    this.loadProjects();
  }

  onClearFilters(): void {
    this.searchTerm = '';
    this.isActiveFilter = null;
    this.sortBy = '';
    this.sortOrder = 'asc';
    this.loadProjects();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadProjects();
  }

  getStatusChipClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Hoạt động' : 'Không hoạt động';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  }
}
