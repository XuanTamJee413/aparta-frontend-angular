// src/app/models/utility.model.ts

export interface UtilityDto {
  utilityId: string;
  name: string | null;
  status: string | null;
  location: string | null;
  periodTime: number | null; // double/float -> number
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UtilityCreateDto {
  utilityId?: string | null;
  name: string | null;
  status: string | null;
  location: string | null;
  periodTime: number | null;
}

export interface UtilityUpdateDto {
  name: string | null;
  status: string | null;
  location: string | null;
  periodTime: number | null;
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