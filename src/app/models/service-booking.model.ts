// src/app/models/service-booking.model.ts


export interface ServiceBookingCreateDto {
  serviceId: string;
  bookingDate: string; 
  residentNote?: string | null;
}


export interface ServiceBookingDto {
  serviceBookingId: string;
  serviceId: string;
  serviceName: string;
  residentId: string;
  residentName: string;
  bookingDate: string; 
  status: string;
  paymentAmount: number | null;
  residentNote: string | null;
  staffNote: string | null;
  createdAt: string | null;
}

export interface ServiceBookingUpdateDto {
  status: string;
  paymentAmount?: number | null;
  staffNote?: string | null;
}

export interface ServiceQueryParameters {
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