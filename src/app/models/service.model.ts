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