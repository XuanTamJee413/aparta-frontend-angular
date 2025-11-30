// src/app/models/task.model.ts

export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TaskQueryParameters {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string | null;
  status?: string | null;
  type?: string | null;
  assigneeId?: string | null;
}

// --- [MỚI] DTO thông tin nhân viên trong list ---
export interface TaskAssigneeDto {
  userId: string;
  name: string;
  phone: string;
}

// --- [MỚI] DTO Gỡ nhân viên ---
export interface TaskUnassignDto {
  taskId: string;
  assigneeUserId: string;
}

// 3. DTO Hiển thị Task (Output)
export interface TaskDto {
  taskId: string;
  serviceBookingId?: string | null;
  operationStaffId: string;
  operationStaffName: string;
  type: string;
  description: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
  assigneeNote?: string | null;
  
  // Thông tin người được giao việc (Single - Có thể giữ để tương thích ngược)
  assigneeUserId?: string | null;
  assigneeName?: string | null;
  assignedDate?: string | null;

  // --- [MỚI] Danh sách những người được giao ---
  assignees?: TaskAssigneeDto[]; 
}

// 4. DTO Tạo mới Task
export interface TaskCreateDto {
  serviceBookingId?: string | null;
  type: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
}

// 5. DTO Phân công Task
export interface TaskAssignmentCreateDto {
  taskId: string;
  assigneeUserId: string; 
}

// 6. DTO Cập nhật trạng thái
export interface TaskUpdateStatusDto {
  status: string;
  note?: string | null;
}

// 7. Mock Model cho Nhân viên
export interface StaffDto {
  userId: string;
  name: string;
  role: string;
  phone?: string; // Có thể thêm phone nếu cần hiển thị
}