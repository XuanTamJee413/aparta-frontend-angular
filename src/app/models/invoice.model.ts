export interface InvoiceDto {
  invoiceId: string;
  apartmentId: string;
  apartmentCode: string;
  staffId?: string | null;
  staffName?: string | null;
  feeType: string; // e.g., 'UTILITY'
  price: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  residentName?: string | null;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  invoiceId: string;
}

export interface PagedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface InvoiceQueryParameters {
  status?: string;
  searchTerm?: string;
  month?: string;
  sortBy?: string;
  sortOrder?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface InvoiceResponse {
  data: PagedList<InvoiceDto>;
  succeeded: boolean;
  message: string;
}

