// DTOs cho Invoice Management

export interface InvoiceDto {
  invoiceId: string;
  apartmentId: string;
  apartmentCode: string;
  staffId?: string | null;
  staffName?: string | null;
  feeType: string;
  price: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  residentName?: string | null;
}

export interface InvoiceGroupDto {
  apartmentId: string;
  apartmentCode: string;
  residentName?: string | null;
  invoices: InvoiceDto[];
  totalAmount: number;
}

export interface InvoiceDetailDto {
  invoiceId: string;
  apartmentId: string;
  apartmentCode: string;
  residentName?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  feeType: string;
  price: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItemDto[];
}

export interface InvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  invoiceId: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

import { BuildingDto } from './building.model';

export interface InvoiceSnapshot {
  selectedBuilding: BuildingDto | null;
  payerName: string;
  apartmentAddress: string;
  itemDescription: string;
  amount: number;
  note: string;
  imagePreviews: string[];
  endDate: string | null;
}

