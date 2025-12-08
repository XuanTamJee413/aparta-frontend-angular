import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core'; // Thêm ViewChild, TemplateRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BuildingService, BuildingDto, BuildingListResponse } from '../../../../services/admin/building.service';
import { ProjectService, ProjectDto } from '../../../../services/admin/project.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Thêm Dialog
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Thêm Snackbar để thông báo

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatIconModule,
    MatDialogModule, // Import Module Dialog
    MatSnackBarModule // Import Module Snackbar
  ],
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.css']
})
export class BuildingListComponent implements OnInit, OnDestroy {
  buildings: BuildingDto[] = [];
  projects: ProjectDto[] = [];
  
  searchTerm: string = '';
  selectedProjectId: string = '';
  selectedStatus: string = ''; 

  currentPage = 1;
  pageSize = 5; 
  totalCount = 0;
  
  sortColumn: string = 'createdAt';
  sortDirection: 'desc' | 'asc' = 'desc';

  isLoading = false;
  Math = Math; 

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // [MỚI] Biến để xử lý Dialog xác nhận
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  buildingToToggle: BuildingDto | null = null; // Tòa nhà đang chọn để thao tác

  constructor(
    private buildingService: BuildingService,
    private projectService: ProjectService,
    private dialog: MatDialog, // Inject Dialog
    private snackBar: MatSnackBar // Inject Snackbar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadBuildings();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(), 
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.loadBuildings();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ... (Giữ nguyên các hàm loadProjects, loadBuildings, onSearchInput, onFilterChange, onSort, getSortIcon, onPageChange ...)
  loadProjects() {
    this.projectService.getAllProjects().subscribe({
      next: (res: any) => {
        if (res.succeeded) {
          this.projects = res.data;
        }
      }
    });
  }

  loadBuildings() {
    this.isLoading = true;
    const skip = (this.currentPage - 1) * this.pageSize;
    let isActive: boolean | undefined = undefined;
    if (this.selectedStatus === 'true') isActive = true;
    if (this.selectedStatus === 'false') isActive = false;

    const query = {
      searchTerm: this.searchTerm || undefined,
      projectId: this.selectedProjectId || undefined,
      isActive: isActive,
      sortBy: this.sortColumn,
      sortOrder: this.sortDirection,
      skip: skip,
      take: this.pageSize
    };
    this.buildingService.getBuildings(query).subscribe({
      next: (res: BuildingListResponse) => {
        if (res.succeeded && res.data) {
          this.buildings = res.data.items;
          this.totalCount = res.data.totalCount;
        } else {
          this.buildings = [];
          this.totalCount = 0;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadBuildings();
  }

  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadBuildings();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBuildings();
  }

  get hasPreviousPage(): boolean { return this.currentPage > 1; }
  get hasNextPage(): boolean { return this.currentPage * this.pageSize < this.totalCount; }
  get totalPages(): number { return Math.ceil(this.totalCount / this.pageSize); }

  // [MỚI] Hàm mở Dialog xác nhận hoặc thực hiện kích hoạt
  openToggleStatusDialog(building: BuildingDto) {
    this.buildingToToggle = building;
    
    if (building.isActive) {
      // Nếu đang Active -> Muốn dừng -> Hiện Dialog cảnh báo
      this.dialog.open(this.confirmDialog, {
        width: '400px',
        disableClose: true
      });
    } else {
      // Nếu đang Inactive -> Muốn kích hoạt -> Làm luôn (hoặc hiện dialog tùy ý, ở đây làm luôn cho nhanh)
      this.executeUpdateStatus(true);
    }
  }

  // [MỚI] Hàm gọi API cập nhật trạng thái
  executeUpdateStatus(newStatus: boolean) {
    if (!this.buildingToToggle) return;

    this.isLoading = true;
    this.buildingService.updateBuilding(this.buildingToToggle.buildingId, { isActive: newStatus }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.succeeded) {
          this.showNotification(newStatus ? 'Đã kích hoạt tòa nhà.' : 'Đã dừng hoạt động tòa nhà.', 'success');
          this.loadBuildings(); // Tải lại danh sách
        } else {
          this.showNotification(res.message || 'Lỗi cập nhật trạng thái.', 'error');
        }
        this.buildingToToggle = null; // Reset
      },
      error: (err) => {
        this.isLoading = false;
        this.showNotification(err.error?.message || 'Lỗi hệ thống.', 'error');
        this.buildingToToggle = null;
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Đóng', {
      duration: type === 'success' ? 3000 : 4000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      verticalPosition: 'top'
    });
  }
}