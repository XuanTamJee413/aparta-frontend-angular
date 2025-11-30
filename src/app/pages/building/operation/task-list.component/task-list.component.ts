import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { 
  TaskDto, PagedList, TaskQueryParameters, 
  TaskCreateDto, TaskAssignmentCreateDto, StaffDto, 
  TaskAssigneeDto, TaskUnassignDto // <-- Thêm các DTO mới
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
  currentAssignees: TaskAssigneeDto[] = []; // Danh sách nhân viên HIỆN TẠI của task đang chọn

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
    { label: 'Định kỳ', value: 'periodic' },
    { label: 'Yêu cầu dịch vụ', value: 'ServiceRequest' } // Thêm loại này
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

  // --- LOAD DATA ---
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

  // Search & Filter & Pagination (Giữ nguyên)
  onSearch(): void { this.currentPage = 1; this.loadTasks(); }
  onFilterChange(): void { this.currentPage = 1; this.loadTasks(); }
  onPageChange(page: number): void { 
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page; 
      this.loadTasks(); 
    } 
  }
  get hasPreviousPage(): boolean { return this.currentPage > 1; }
  get hasNextPage(): boolean { return this.currentPage < this.totalPages; }

  // --- CREATE TASK (Giữ nguyên logic cũ, thêm validate nếu cần) ---
  openCreateModal(): void {
    this.resetMessages();
    this.createForm.reset({ type: 'suddenly' });
    this.createDialog.nativeElement.showModal();
  }

  saveNewTask(): void {
    // ... (Logic validate ngày tháng giữ nguyên) ...
    // ... Copy logic saveNewTask cũ vào đây ...
    // Để ngắn gọn mình ko paste lại đoạn validate ngày tháng ở đây
    
    if (this.createForm.invalid) {
        this.createForm.markAllAsTouched();
        return;
    }
    
    const formVal = this.createForm.value;
    const createDto: TaskCreateDto = {
        serviceBookingId: null,
        type: formVal.type,
        description: formVal.description,
        startDate: formVal.startDate || null,
        endDate: formVal.endDate || null
    };

    this.taskService.createTask(createDto).subscribe({
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

  // --- ASSIGN TASK (CẬP NHẬT MỚI) ---
  openAssignModal(task: TaskDto): void {
    this.resetMessages();
    this.selectedTaskId = task.taskId;
    
    // Load danh sách người đang làm task này vào biến tạm để hiển thị
    this.currentAssignees = task.assignees || [];
    
    this.assignForm.reset();
    // Dropdown để trống để người dùng chọn người mới
    this.assignForm.patchValue({ assigneeUserId: '' }); 
    
    this.assignDialog.nativeElement.showModal();
  }

  // 1. Thêm nhân viên (Giao việc)
  addAssignee(): void {
    this.resetMessages();
    if (this.assignForm.invalid || !this.selectedTaskId) return;

    const assigneeId = this.assignForm.value.assigneeUserId;

    // Check trùng trên Frontend cho nhanh (UX)
    if (this.currentAssignees.some(a => a.userId === assigneeId)) {
        this.dialogErrorMessage = "Nhân viên này đã có trong danh sách.";
        return;
    }

    const dto: TaskAssignmentCreateDto = {
      taskId: this.selectedTaskId,
      assigneeUserId: assigneeId
    };

    this.taskService.assignTask(dto).subscribe({
      next: () => {
        this.setSuccessMessage('Đã thêm nhân viên thành công!');
        this.loadTasks(); // Reload để cập nhật list assignees mới nhất từ server
        
        // Cập nhật lại list local để hiển thị ngay trong dialog (nếu không muốn đóng dialog)
        // Cách tốt nhất là đóng dialog rồi mở lại hoặc reload data ngầm
        // Ở đây mình chọn cách đơn giản: Reload data trang chủ, nhưng người dùng phải mở lại dialog để thấy update
        // HOẶC: Bạn có thể fetch lại task detail
        this.closeDialogs(); 
      },
      error: (err: HttpErrorResponse) => {
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi phân công.';
      }
    });
  }

  // 2. Gỡ nhân viên (Unassign)
  removeAssignee(assigneeId: string): void {
    if (!confirm('Bạn có chắc muốn gỡ nhân viên này khỏi công việc?')) return;
    if (!this.selectedTaskId) return;

    const dto: TaskUnassignDto = {
        taskId: this.selectedTaskId,
        assigneeUserId: assigneeId
    };

    this.taskService.unassignTask(dto).subscribe({
        next: () => {
            this.setSuccessMessage('Đã gỡ nhân viên thành công!');
            this.loadTasks();
            this.closeDialogs(); 
        },
        error: (err: HttpErrorResponse) => {
            this.dialogErrorMessage = err.error?.message || 'Lỗi khi gỡ nhân viên.';
        }
    });
  }

  // --- HELPER ---
  closeDialogs(): void {
    this.createDialog.nativeElement.close();
    this.assignDialog.nativeElement.close();
  }

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