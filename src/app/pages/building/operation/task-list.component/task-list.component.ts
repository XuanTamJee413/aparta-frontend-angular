// src/app/pages/operation/task-list/task-list.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { 
  TaskDto, PagedList, TaskQueryParameters, 
  TaskCreateDto, TaskAssignmentCreateDto, StaffDto 
} from '../../../../models/task.model';
import { TaskService } from '../../../../services/operation/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {

  @ViewChild('createTaskDialog') createDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('assignTaskDialog') assignDialog!: ElementRef<HTMLDialogElement>;

  tasks: TaskDto[] = [];
  maintenanceStaffs: StaffDto[] = [];
  isLoading = false;

  // Form
  createForm: FormGroup;
  assignForm: FormGroup;
  selectedTaskId: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Filter
  searchControl = new FormControl('');
  statusFilterControl = new FormControl('');
  typeFilterControl = new FormControl('');

  // Options
  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Mới', value: 'New' },
    { label: 'Đã giao', value: 'Assigned' },
    { label: 'Đang làm', value: 'In Progress' },
    { label: 'Hoàn thành', value: 'Completed' }
  ];

  typeOptions = [
    { label: 'Tất cả loại', value: '' },
    { label: 'Đột xuất', value: 'suddenly' },
    { label: 'Đề xuất', value: 'propose' },
    { label: 'Định kỳ', value: 'periodic' }
  ];

  // Messages
  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      type: ['suddenly', Validators.required],
      description: ['', Validators.required],
      startDate: [''],
      endDate: ['']
    });

    this.assignForm = this.fb.group({
      assigneeUserId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadStaffs();
  }

  loadTasks(): void {
    this.isLoading = true;
    const params: TaskQueryParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value?.trim() || null,
      status: this.statusFilterControl.value || null,
      type: this.typeFilterControl.value || null
    };

    this.taskService.getTasks(params).subscribe({
      next: (data: PagedList<TaskDto>) => {
        this.tasks = data.items;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.currentPage = data.pageNumber;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải tasks:', err);
        this.isLoading = false;
      }
    });
  }

  loadStaffs(): void {
    this.taskService.getMaintenanceStaffs().subscribe({
      next: (data) => this.maintenanceStaffs = data,
      error: (err) => console.error('Lỗi tải nhân viên:', err)
    });
  }

  // Search & Filter
  onSearch(): void { this.currentPage = 1; this.loadTasks(); }
  onFilterChange(): void { this.currentPage = 1; this.loadTasks(); }

  // Pagination
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  get hasPreviousPage(): boolean { return this.currentPage > 1; }
  get hasNextPage(): boolean { return this.currentPage < this.totalPages; }

  // Dialogs
  openCreateModal(): void {
    this.resetMessages();
    this.createForm.reset({ type: 'suddenly' });
    this.createDialog.nativeElement.showModal();
  }

  openAssignModal(task: TaskDto): void {
    this.resetMessages();
    this.selectedTaskId = task.taskId;
    this.assignForm.patchValue({ assigneeUserId: task.assigneeUserId || '' });
    this.assignDialog.nativeElement.showModal();
  }

  closeDialogs(): void {
    this.createDialog.nativeElement.close();
    this.assignDialog.nativeElement.close();
  }

  // Create Task
  saveNewTask(): void {
    this.resetMessages();
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const dto: TaskCreateDto = {
      serviceBookingId: null,
      type: this.createForm.value.type,
      description: this.createForm.value.description,
      startDate: this.createForm.value.startDate || null,
      endDate: this.createForm.value.endDate || null
    };

    this.taskService.createTask(dto).subscribe({
      next: () => {
        this.loadTasks();
        this.closeDialogs();
        this.setSuccessMessage('Tạo công việc thành công!');
      },
      error: (err: HttpErrorResponse) => {
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi tạo task.';
      }
    });
  }

  // Assign Task
  submitAssignment(): void {
    this.resetMessages();
    if (this.assignForm.invalid || !this.selectedTaskId) return;

    const dto: TaskAssignmentCreateDto = {
      taskId: this.selectedTaskId,
      assigneeUserId: this.assignForm.value.assigneeUserId
    };

    this.taskService.assignTask(dto).subscribe({
      next: () => {
        this.loadTasks();
        this.closeDialogs();
        this.setSuccessMessage('Phân công thành công!');
      },
      error: (err: HttpErrorResponse) => {
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi phân công.';
      }
    });
  }

  // Helpers
  private resetMessages(): void {
    this.pageSuccessMessage = null;
    this.dialogErrorMessage = null;
  }

  private setSuccessMessage(msg: string): void {
    this.pageSuccessMessage = msg;
    setTimeout(() => this.pageSuccessMessage = null, 3000);
  }

  getStatusLabel(status: string): string {
    const opt = this.statusOptions.find(o => o.value === status);
    return opt ? opt.label : status;
  }

  getTypeLabel(type: string): string {
    const opt = this.typeOptions.find(o => o.value === type);
    return opt ? opt.label : type;
  }
}