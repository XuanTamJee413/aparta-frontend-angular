// src/app/models/meter-reading.model.ts

export interface ApartmentDto {
  apartmentId: string;
  buildingId: string;
  code: string;
  type: string;
  status: string;
  area: number;
  createdAt: string;
}

export type MeterReadingServiceDto = string[];

export interface MeterReadingCreateDto {
  feeType: string;
  readingValue: number;
  readingDate: string;
}

export interface MeterReadingUpdateDto {
  readingValue: number;
}

export interface BillingRequestDto {
  buildingId: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
}

// Additional interfaces for meter reading history
export interface MeterReadingDto {
  readingId: string;
  meterReadingId?: string;
  apartmentId: string;
  apartmentName?: string;
  feeType: string;
  readingValue: number;
  readingDate: string;
  billingPeriod?: string;
  createdAt?: string;
  updatedAt?: string;
  invoiceItemId?: string | null;
}

export interface MeterReadingCheckResponse {
  exists: boolean;
  meterReading: MeterReadingDto | null;
  latestReading: MeterReadingDto | null;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

// DTO cho báo cáo tình trạng ghi chỉ số
export interface MeterReadingStatusDto {
  apartmentId: string;
  apartmentCode: string;
  feeType: string;
  readingValue: number | null;
  readingId: string | null;
  readingDate: string | null;
  recordedByName: string | null;
  invoiceItemId: string | null;
  status: string; // "Chưa ghi" | "Đã ghi - Đã khóa" | "Đã ghi - Mở"
}

