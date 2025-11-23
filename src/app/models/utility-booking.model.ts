export interface UtilityQueryParameters {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string | null;
  status?: string | null;
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

// DTO Tạo mới (Cư dân)
export interface UtilityBookingCreateDto {
  utilityId: string;
  bookingDate: string; // Bắt đầu (ISO String)
  bookedAt: string;    // Kết thúc (ISO String)
  residentNote?: string | null;
}

// DTO Hiển thị (Output)
export interface UtilityBookingDto {
  utilityBookingId: string;
  utilityId: string;
  utilityName: string;
  residentId: string;
  residentName: string;
  bookingDate: string; // Bắt đầu
  bookedAt: string | null; // Kết thúc
  status: string;
  residentNote: string | null;
  staffNote: string | null;
  createdAt: string | null;
}

// DTO Cập nhật (Staff)
export interface UtilityBookingUpdateDto {
  status: string;
  staffNote?: string | null;
}

export interface BookedSlotDto {
  start: string;
  end: string;
}