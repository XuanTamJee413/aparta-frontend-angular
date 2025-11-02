export interface Meter {
  meterId: string;
  meterType: 'ELECTRIC' | 'WATER';
  lastReading: number;
  currentReading: number | null;
  isRecorded: boolean;
  readingDate?: string;
  recordedByName?: string;
  inputError?: boolean;
  saving?: boolean;
  saveError?: string;
  saveSuccess?: boolean;
  consumption?: number;
  estimatedCost?: number;
}

export interface Apartment {
  apartmentId: string;
  apartmentCode: string;
  buildingId: string;
  meters: Meter[];
  status?: string;
}

export interface MeterReading {
  id: string;
  apartmentCode: string;
  meterType: 'ELECTRIC' | 'WATER';
  previousReading: number;
  currentReading: number;
  consumption: number;
  recordedAt: string;
  recordedById: string;
  recordedByName: string;
  buildingId: string;
  buildingName: string;
  billingPeriod: string;
}

export interface MeterReadingResponse {
  data: MeterReading[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface MeterReadingProgress {
  buildingId: string;
  buildingName: string;
  billingPeriod: string;
  totalApartments: number;
  recordedByMeterType: {
    [key: string]: number; // key: 'WATER' | 'ELECTRIC', value: count
  };
  progressByMeterType: {
    [key: string]: number; // key: 'WATER' | 'ELECTRIC', value: percentage
  };
  lastUpdated: string;
}

export interface MeterReadingProgressResponse {
  data: MeterReadingProgress;
  succeeded: boolean;
  message: string;
}

export interface MeterReadingQueryParams {
  buildingCode: string;
  billingPeriod: string;
  pageNumber?: number;
  pageSize?: number;
}
