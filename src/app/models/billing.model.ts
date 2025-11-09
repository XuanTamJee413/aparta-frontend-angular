// DTO cho Generate Invoices Request
export interface GenerateInvoicesRequest {
  buildingId: string;
  billingPeriod?: string;
}

// Response từ API Generate Invoices
export interface GenerateInvoicesResponse {
  succeeded: boolean;
  message: string;
  data?: any;
}

