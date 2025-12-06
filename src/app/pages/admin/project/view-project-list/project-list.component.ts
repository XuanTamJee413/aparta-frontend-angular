import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProjectService, ProjectDto, ProjectListResponse } from '../../../../services/admin/project.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatDialogModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: ProjectDto[] = [];
  filteredProjects: ProjectDto[] = [];
  searchTerm: string = '';
  isLoading = false;
  sortColumn: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  Math = Math;
  pendingProject: ProjectDto | null = null;

  // Xử lý Live Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  constructor(
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjects();

    // Setup Live Search (Debounce 300ms)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.loadProjects(); // Gọi API lại hoặc filter client tùy chiến lược. Ở đây gọi API cho chuẩn data.
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects() {
    this.isLoading = true;
    const query = {
      searchTerm: this.searchTerm || undefined
    };

    this.projectService.getProjects(query).subscribe({
      next: (res: ProjectListResponse) => {
        if (res.succeeded && res.data) {
          this.projects = res.data;
          // Clone ra filteredProjects và sort ngay lập tức
          this.sortData(this.sortColumn, false); 
        } else {
          this.projects = [];
          this.filteredProjects = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Sự kiện khi gõ phím
  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  // Hàm Sort Client-side
  onSort(column: string) {
    // Nếu click lại cột cũ -> đổi chiều, cột mới -> mặc định desc (hoặc asc tùy ý)
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData(this.sortColumn, true);
  }

  sortData(column: string, updateFilteredOnly: boolean = true) {
    // Nếu chỉ sort client thì dùng filteredProjects, nếu muốn reset thì lấy từ projects gốc
    let data = updateFilteredOnly ? [...this.filteredProjects] : [...this.projects];

    data.sort((a: any, b: any) => {
      let valueA = a[column];
      let valueB = b[column];

      // Xử lý null/undefined
      if (valueA == null) valueA = '';
      if (valueB == null) valueB = '';

      // Xử lý so sánh
      let comparison = 0;
      if (typeof valueA === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else {
        comparison = valueA - valueB; // Số hoặc Date (nếu Date dạng timestamp/số)
        // Nếu Date dạng string ISO thì localeCompare vẫn chạy đúng
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredProjects = data;
  }

  // Helper hiển thị icon sort
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  onToggleStatus(project: ProjectDto) {
    if (project.isActive) {
      // Nếu đang Active -> Hiện Dialog xác nhận
      this.pendingProject = project;
      this.dialog.open(this.confirmDialog, {
        width: '400px',
        disableClose: true
      });
    } else {
      // Nếu đang Inactive -> Mở khóa luôn
      this.executeToggle(project, true);
    }
  }

  confirmDeactivate() {
    if (this.pendingProject) {
      this.executeToggle(this.pendingProject, false);
      this.pendingProject = null;
    }
  }

  private executeToggle(project: ProjectDto, newStatus: boolean) {
    this.isLoading = true;
    this.projectService.updateProject(project.projectId, { isActive: newStatus }).subscribe({
      next: (res) => {
        if (res.succeeded) {
          project.isActive = newStatus;
          this.showNotification(newStatus ? 'Đã kích hoạt lại dự án.' : 'Đã khóa dự án.', 'success');
        } else {
          this.showNotification(res.message || 'Lỗi cập nhật.', 'error');
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('Lỗi hệ thống.', 'error');
        this.isLoading = false;
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Đóng', {
      duration: type === 'success' ? 3000 : 4000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      verticalPosition: 'top'
    });
  }
}