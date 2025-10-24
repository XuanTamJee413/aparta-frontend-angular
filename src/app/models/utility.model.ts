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