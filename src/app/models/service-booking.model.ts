// src/app/models/service-booking.model.ts

// DTO Cư dân gửi lên khi tạo
export interface ServiceBookingCreateDto {
  serviceId: string;
  bookingDate: string; // Gửi dưới dạng ISO string
  residentNote?: string | null;
}

// DTO trả về thông tin chi tiết
export interface ServiceBookingDto {
  serviceBookingId: string;
  serviceId: string;
  serviceName: string;
  residentId: string;
  residentName: string;
  bookingDate: string; // Nhận về là string
  status: string;
  paymentAmount: number | null;
  residentNote: string | null;
  staffNote: string | null;
  createdAt: string | null;
}