import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { TaskDto, PagedList, TaskQueryParameters } from '../../../../models/task.model';
import { TaskService } from '../../../../services/operation/task.service';

@Component({
  selector: 'app-my-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-task-list.component.html',
  styleUrls: ['./my-task-list.component.css']
})
export class MyTaskListComponent implements OnInit {

  @ViewChild('reportDialog') dialog!: ElementRef<HTMLDialogElement>;

  tasks: TaskDto[] = [];
  reportForm: FormGroup;
  selectedTaskId: string | null = null;
  isLoading = false;

  // Pagination & Filter
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  statusFilterControl = new FormControl('');

  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Được giao (Assigned)', value: 'Assigned' },
    { label: 'Đang làm (In Progress)', value: 'In Progress' },
    { label: 'Hoàn thành (Completed)', value: 'Completed' }
  ];

  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.reportForm = this.fb.group({
      note: ['', Validators.required] // Bắt buộc phải có ghi chú khi hoàn thành
    });
  }

  ngOnInit(): void {
    this.loadMyTasks();
  }

  loadMyTasks(): void {
    this.isLoading = true;
    const params: TaskQueryParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      status: this.statusFilterControl.value || null
    };

    this.taskService.getMyTasks(params).subscribe({
      next: (data) => {
        this.tasks = data.items;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.currentPage = data.pageNumber;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // --- HÀNH ĐỘNG 1: BẮT ĐẦU LÀM VIỆC ---
  startTask(task: TaskDto): void {
    if (!confirm('Bạn xác nhận bắt đầu thực hiện công việc này?')) return;

    this.taskService.updateStatus(task.taskId, 'In Progress', null).subscribe({
      next: () => {
        this.setSuccessMessage('Đã chuyển trạng thái sang Đang thực hiện.');
        this.loadMyTasks();
      },
      error: (err) => alert('Lỗi: ' + err.message)
    });
  }

  // --- HÀNH ĐỘNG 2: HOÀN THÀNH CÔNG VIỆC (Mở Dialog) ---
  openReportModal(task: TaskDto): void {
    this.selectedTaskId = task.taskId;
    this.reportForm.reset();
    this.dialogErrorMessage = null;
    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.selectedTaskId = null;
  }

  submitReport(): void {
    if (this.reportForm.invalid || !this.selectedTaskId) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const note = this.reportForm.value.note;

    this.taskService.updateStatus(this.selectedTaskId, 'Completed', note).subscribe({
      next: () => {
        this.closeDialog();
        this.setSuccessMessage('Báo cáo hoàn thành công việc thành công!');
        this.loadMyTasks();
      },
      error: (err: HttpErrorResponse) => {
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi cập nhật.';
      }
    });
  }
  
  // Helpers
  onFilterChange(): void { this.currentPage = 1; this.loadMyTasks(); }
  onPageChange(page: number): void { 
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page; 
      this.loadMyTasks(); 
    } 
  }
  
  private setSuccessMessage(msg: string): void {
    this.pageSuccessMessage = msg;
    setTimeout(() => this.pageSuccessMessage = null, 3000);
  }

  formatStatusClass(status: string): string {
    if (!status) return '';
    return status.toLowerCase().replace(/\s+/g, '-');
  }
  
  // Helper để disable nút
  canStart(status: string): boolean { return status === 'Assigned'; }
  canComplete(status: string): boolean { return status === 'In Progress'; }

  getStatusLabel(status: string): string {
  const map: any = {
    Assigned: 'Được giao',
    'In Progress': 'Đang thực hiện',
    Completed: 'Đã hoàn thành'
  };
  return map[status] || status;
}

getTypeLabel(type: string): string {
  const map: any = {
    suddenly: 'Đột xuất',
    propose: 'Đề xuất',
    periodic: 'Định kỳ'
  };
  return map[type] || type;
}
}