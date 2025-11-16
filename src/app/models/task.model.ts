// 1. Interface PagedList (Generic)
// Dùng để hứng dữ liệu phân trang trả về từ Backend
export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// 2. Interface Query Parameters dành riêng cho Task
// Map chính xác với TaskQueryParameters ở Backend
export interface TaskQueryParameters {
  // Phân trang
  pageNumber: number;
  pageSize: number;

  // Tìm kiếm & Lọc chung
  searchTerm?: string | null;
  status?: string | null;

  // Lọc riêng của Task (Quan trọng)
  type?: string | null;       // Lọc theo loại: Repair, Cleaning...
  assigneeId?: string | null; // Lọc theo người được giao việc
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
  
  // Thông tin người được giao việc
  assigneeUserId?: string | null;
  assigneeName?: string | null;
  assignedDate?: string | null;
}

// 4. DTO Tạo mới Task (Input)
export interface TaskCreateDto {
  serviceBookingId?: string | null; // Null nếu là task lẻ
  type: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
}

// 5. DTO Phân công Task (Input)
export interface TaskAssignmentCreateDto {
  taskId: string;
  assigneeUserId: string; 
}

// 6. DTO Cập nhật trạng thái (Input - Dành cho Maintenance Staff)
export interface TaskUpdateStatusDto {
  status: string;
  note?: string | null;
}

// 7. Mock Model cho Nhân viên (Để đổ dữ liệu vào dropdown Assign)
export interface StaffDto {
  userId: string;
  name: string;
  role: string;
}