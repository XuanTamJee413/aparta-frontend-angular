export interface UtilityDto {
  utilityId: string;
  name: string | null;
  status: string | null;
  location: string | null;
  periodTime: number | null;
  openTime: string | null;
  closeTime: string | null;
  buildingId: string | null; // <--- THÊM
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UtilityCreateDto {
  name: string | null;
  status: string | null;
  location: string | null;
  periodTime: number | null;
  openTime: string | null;
  closeTime: string | null;
  buildingId: string; // <--- THÊM (Bắt buộc khi tạo)
}

export interface UtilityUpdateDto {
  name: string | null;
  status: string | null;
  location: string | null;
  periodTime: number | null;
  openTime: string | null;
  closeTime: string | null;
  // buildingId thường không cho sửa, nên không cần thêm vào đây hoặc để optional
}

// Thêm interface nhỏ để hứng dữ liệu dropdown tòa nhà
export interface BuildingSimpleDto {
  buildingId: string;
  name: string;
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