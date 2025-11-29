export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Các interface nghiệp vụ Staff Assignment
export interface StaffAssignmentDto {
  assignmentId: string;
  userId: string;
  staffName: string;
  staffCode: string;
  
  buildingId: string;
  buildingName: string;
  
  position: string;
  scopeOfWork?: string;
  
  startDate: string; // DateOnly string (yyyy-MM-dd)
  endDate?: string;
  
  isActive: boolean;
  assignedBy?: string;
  createdAt?: string;
}

export interface BuildingAssignmentDto {
  buildingId: string;
  name: string;
  buildingCode: string;
}

export interface StaffUserDto {
  userId: string;
  name: string;
  staffCode: string;
  email: string;
  roleName: string;
}

export interface StaffAssignmentCreateDto {
  userId: string;
  buildingId: string;
  position: string;
  scopeOfWork?: string;
  startDate: string;
}

export interface StaffAssignmentUpdateDto {
  position?: string;
  scopeOfWork?: string;
  endDate?: string;
  isActive: boolean;
}

export interface StaffAssignmentQuery {
  searchTerm?: string;
  buildingId?: string;
  userId?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}