// src/app/models/service.model.ts

export interface ServiceDto {
  serviceId: string;
  name: string | null;
  price: number | null;
  status: string | null;
  createdAt: string | null; // JSON sẽ chuyển DateTime thành string
  updatedAt: string | null;
}

export interface ServiceCreateDto {
  serviceId?: string | null; // ID có thể được tạo ở backend
  name: string | null;
  price: number | null;
  status: string | null;
}

export interface ServiceUpdateDto {
  name: string | null;
  price: number | null;
  status: string | null;
}

// (Các interface ServiceDto, ServiceCreateDto, ServiceUpdateDto giữ nguyên)
// ...

// THÊM CÁC INTERFACE MỚI:

// 1. Interface cho các tham số truy vấn
export interface ServiceQueryParameters {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string | null;
  status?: string | null;
}

// 2. Interface cho kết quả trả về dạng PagedList
// (Đây là kiểu 'T' chung, có thể tái sử dụng cho Utility)
export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}