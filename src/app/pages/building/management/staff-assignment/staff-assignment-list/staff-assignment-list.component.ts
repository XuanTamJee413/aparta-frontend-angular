import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StaffAssignmentService } from '../../../../../services/management/staff-assignment.service';
import { StaffAssignmentDialogComponent } from '../staff-assignment-dialog/staff-assignment-dialog.component';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { StaffAssignmentDto, StaffAssignmentQuery, BuildingAssignmentDto } from '../../../../../models/staff-assignment.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-staff-assignment-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatSnackBarModule,
    MatPaginatorModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './staff-assignment-list.component.html',
  styleUrls: ['./staff-assignment-list.component.css']
})
export class StaffAssignmentListComponent implements OnInit {
  private service = inject(StaffAssignmentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);
  private searchSubject = new Subject<string>();
  
  assignments: StaffAssignmentDto[] = [];
  buildings: BuildingAssignmentDto[] = [];
  
  // Filters
  searchTerm = '';
  filterBuildingId = '';
  filterStatus: boolean | null = true; 
  
  // Pagination
  totalCount = 0;
  pageSize = 10;
  pageIndex = 1;
  
  isLoading = false;

  ngOnInit(): void {
    this.loadBuildings();
    this.loadAssignments();

    // 2. Cấu hình lắng nghe sự thay đổi của ô search
    this.searchSubject.pipe(
      debounceTime(500), // Chờ 500ms sau khi người dùng ngừng gõ
      distinctUntilChanged() // Chỉ tìm nếu nội dung khác lần trước
    ).subscribe(searchText => {
      this.searchTerm = searchText;
      this.pageIndex = 1; // Reset về trang 1 khi tìm kiếm
      this.loadAssignments();
    });
  }

  loadBuildings(): void {
    this.service.getAvailableBuildings('').subscribe(res => {
      if (res.succeeded) this.buildings = res.data || [];
    });
  }

  loadAssignments(): void {
    this.isLoading = true;
    const query: StaffAssignmentQuery = {
      pageNumber: this.pageIndex,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      buildingId: this.filterBuildingId || undefined,
      isActive: this.filterStatus ?? undefined
    };

    this.service.getAssignments(query).subscribe({
      next: (res) => {
        this.assignments = res.data?.items || [];
        this.totalCount = res.data?.totalCount || 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Lỗi tải dữ liệu', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSearchTermChange(searchValue: string): void {
    this.searchSubject.next(searchValue);
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.loadAssignments();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadAssignments();
  }

  openCreateModal(): void {
    const ref = this.dialog.open(StaffAssignmentDialogComponent, {
      width: '600px',
      data: { mode: 'create', buildings: [] }
    });

    ref.afterClosed().subscribe(result => {
      if (result) this.loadAssignments();
    });
  }

  openEditModal(item: StaffAssignmentDto): void {
    const ref = this.dialog.open(StaffAssignmentDialogComponent, {
      width: '600px',
      data: { mode: 'edit', assignment: item, buildings: this.buildings }
    });

    ref.afterClosed().subscribe(result => {
      if (result) this.loadAssignments();
    });
  }

  deleteAssignment(item: StaffAssignmentDto): void {
    const isAdmin = this.auth.hasRole('admin');
    
    // Cấu hình nội dung Dialog
    const dialogData = {
      title: isAdmin ? 'Xóa vĩnh viễn?' : 'Kết thúc công việc?',
      message: `Bạn có chắc muốn ${isAdmin ? 'xóa dữ liệu' : 'kết thúc phân công'} của nhân viên **${item.staffName}** tại **${item.buildingName}**?`,
      warning: isAdmin 
        ? 'CẢNH BÁO: Hành động này không thể hoàn tác!' 
        : 'Nhân viên sẽ được chuyển sang trạng thái "Inactive" và lưu lại ngày kết thúc.',
      confirmText: isAdmin ? 'Xóa vĩnh viễn' : 'Đồng ý'
    };

    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '450px',
      data: dialogData
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        // Gọi API xóa
        this.service.deleteAssignment(item.assignmentId).subscribe({
          next: (res) => {
            if (res.succeeded) {
              this.snackBar.open('Thao tác thành công', 'Đóng', { duration: 3000, panelClass: 'success-snackbar' });
              this.loadAssignments();
            } else {
              this.snackBar.open(res.message || 'Lỗi xảy ra', 'Đóng', { duration: 3000 });
            }
          },
          error: (err) => {
            this.snackBar.open('Không thể xóa phân công', 'Đóng', { duration: 3000 });
          }
        });
      }
    });
  }
}