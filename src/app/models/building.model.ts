export interface BuildingDto {
  buildingId: string;
  projectId: string;
  buildingCode: string;
  name: string;

  // Thống kê
  numApartments: number;
  numResidents: number;

  // Vật lý & Vận hành
  totalFloors: number;
  totalBasements: number;
  totalArea?: number;
  
  handoverDate?: string;
  warrantyStatus?: string;
  receptionPhone?: string;
  description?: string;

  readingWindowStart: number;
  readingWindowEnd: number;

  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuildingCreateDto {
  projectId: string;
  buildingCode: string;
  name: string;
  totalFloors: number;
  totalBasements: number;
  totalArea?: number;
  handoverDate?: string;
  description?: string;
  receptionPhone?: string;
  readingWindowStart: number;
  readingWindowEnd: number;
}

export interface BuildingUpdateDto {
  name?: string;
  isActive?: boolean;
  totalFloors?: number;
  totalBasements?: number;
  totalArea?: number;
  handoverDate?: string;
  description?: string;
  receptionPhone?: string;
  readingWindowStart?: number;
  readingWindowEnd?: number;
}

export interface BuildingQueryParameters {
  searchTerm?: string;
  skip?: number;
  take?: number;
}

// Response Models
export interface BuildingPaginatedData {
  items: BuildingDto[];
  totalCount: number;
}

export interface BuildingListResponse {
  succeeded: boolean;
  message: string;
  data: BuildingPaginatedData;
}

export interface BuildingDetailResponse {
  succeeded: boolean;
  message: string;
  data: BuildingDto;
}

export interface BuildingBasicResponse {
  succeeded: boolean;
  message: string;
  data?: any;
}