export interface ProjectDto {
  projectId: string;
  projectCode: string;
  name: string;
  
  // Địa chỉ
  address?: string;
  ward?: string;
  district?: string;
  city?: string;

  // Ngân hàng
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;

  // PayOS
  payOSClientId?: string;
  payOSApiKey?: string;
  payOSChecksumKey?: string;

  // Thống kê
  numApartments: number;
  numBuildings: number;

  // System
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectCreateDto {
  projectCode: string;
  name: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  payOSClientId?: string;
  payOSApiKey?: string;
  payOSChecksumKey?: string;
}

export interface ProjectUpdateDto {
  name?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  payOSClientId?: string;
  payOSApiKey?: string;
  payOSChecksumKey?: string;
  isActive?: boolean;
}

export interface ProjectQueryParameters {
  isActive?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Response Models
export interface ProjectListResponse {
  succeeded: boolean;
  message: string;
  data: ProjectDto[];
}

export interface ProjectDetailResponse {
  succeeded: boolean;
  message: string;
  data: ProjectDto;
}

export interface ProjectBasicResponse {
  succeeded: boolean;
  message: string;
  data?: any;
}