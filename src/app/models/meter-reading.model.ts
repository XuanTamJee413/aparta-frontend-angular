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

export interface ApartmentMeterInfo {
  apartmentId: string;
  apartmentCode: string;
  buildingId: string;
  meters: Meter[];
  status?: string;
}

export interface MeterReading {
  id?: string;
  meterReadingId?: string;
  apartmentId: string;
  apartmentCode: string;
  meterId: string;
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
  readingDate?: string;
  estimatedCost?: number;
}

export interface MeterReadingDto {
  meterReadingId?: string;
  id?: string;
  apartmentId: string;
  apartmentCode: string;
  meterId: string;
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
  readingDate?: string;
  estimatedCost?: number;
}

export interface RecordMeterReadingRequest {
  apartmentId: string;
  meterId: string;
  currentReading: number;
}

export interface MeterReadingResponse {
  data: MeterReading[];
  succeeded: boolean;
  message: string;
}

export interface MeterReadingProgress {
  buildingId: string;
  buildingName: string;
  billingPeriod: string;
  totalApartments: number;
  recordedByMeterType: {
    [key: string]: number;
  };
  progressByMeterType: {
    [key: string]: number;
  };
  lastUpdated: string;
}

export interface RecordingProgressDto {
  buildingId: string;
  buildingName: string;
  billingPeriod: string;
  totalApartments: number;
  recordedByMeterType: {
    [key: string]: number;
  };
  progressByMeterType: {
    [key: string]: number;
  };
}

export interface MeterReadingProgressResponse {
  data: RecordingProgressDto;
  succeeded: boolean;
  message: string;
}

export interface MeterReadingQueryParams {
  buildingCode: string;
  billingPeriod: string;
  pageNumber?: number;
  pageSize?: number;
}
