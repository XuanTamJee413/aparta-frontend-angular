import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceManagementService } from '../../../../services/finance/invoice-management.service';
import { PriceQuotationService, PriceQuotationDto, ECalculationMethod } from '../../../../services/management/price-quotation.service';
import { ApartmentService, Apartment } from '../../../../services/building/apartment.service';

export interface OneTimeInvoiceFormData {
  apartmentId: string;
  priceQuotationId: string | null;
  itemDescription: string;
  amount: number;
  note: string;
  images: File[];
}

@Component({
  selector: 'app-create-one-time-invoice-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-one-time-invoice-dialog.component.html',
  styleUrls: ['./create-one-time-invoice-dialog.component.css']
})
export class CreateOneTimeInvoiceDialogComponent implements OnInit, OnChanges {
  @Input() buildingId: string = '';
  @Output() closeEvent = new EventEmitter<boolean>();

  formData: OneTimeInvoiceFormData = {
    apartmentId: '',
    priceQuotationId: null,
    itemDescription: '',
    amount: 0,
    note: '',
    images: []
  };

  apartments: Apartment[] = [];
  priceQuotations: PriceQuotationDto[] = [];
  selectedQuotation: PriceQuotationDto | null = null;
  isCustomMode = false;
  isLoading = false;
  error: string | null = null;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private invoiceService: InvoiceManagementService,
    private priceQuotationService: PriceQuotationService,
    private apartmentService: ApartmentService
  ) {}

  ngOnInit(): void {
    if (this.buildingId) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['buildingId'] && this.buildingId) {
      this.resetForm();
      this.loadData();
    }
  }

  loadData(): void {
    this.loadApartments();
    this.loadPriceQuotations();
  }

  resetForm(): void {
    this.formData = {
      apartmentId: '',
      priceQuotationId: null,
      itemDescription: '',
      amount: 0,
      note: '',
      images: []
    };
    this.selectedQuotation = null;
    this.isCustomMode = false;
    this.error = null;
    this.selectedFiles = [];
    this.imagePreviews = [];
  }

  loadApartments(): void {
    if (!this.buildingId) return;
    
    this.apartmentService.getApartments({
      buildingId: this.buildingId,
      status: 'Đã thuê',
      searchTerm: null,
      sortBy: null,
      sortOrder: null
    }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.apartments = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading apartments:', error);
      }
    });
  }

  loadPriceQuotations(): void {
    if (!this.buildingId) return;

    this.priceQuotationService.getPriceQuotations({
      buildingId: this.buildingId,
      pageNumber: 1,
      pageSize: 100,
      searchTerm: null,
      sortColumn: null,
      sortDirection: null
    }).subscribe({
      next: (response) => {
        if (response.items) {
          // Filter only ONE_TIME quotations
          this.priceQuotations = response.items.filter(
            pq => pq.calculationMethod === ECalculationMethod.ONE_TIME
          );
        }
      },
      error: (error) => {
        console.error('Error loading price quotations:', error);
      }
    });
  }

  onQuotationChange(): void {
    if (this.formData.priceQuotationId && this.formData.priceQuotationId !== 'custom') {
      this.selectedQuotation = this.priceQuotations.find(
        pq => pq.priceQuotationId === this.formData.priceQuotationId!
      ) || null;
      
      if (this.selectedQuotation) {
        this.isCustomMode = false;
        this.formData.itemDescription = this.selectedQuotation.feeType;
        this.formData.amount = this.selectedQuotation.unitPrice;
      }
    } else if (this.formData.priceQuotationId === 'custom') {
      this.isCustomMode = true;
      this.selectedQuotation = null;
      this.formData.itemDescription = '';
      this.formData.amount = 0;
    } else {
      this.isCustomMode = false;
      this.selectedQuotation = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      this.formData.images = this.selectedFiles;
      
      // Create previews
      this.imagePreviews = [];
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreviews.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.formData.images = this.selectedFiles;
  }

  onSubmit(): void {
    if (!this.formData.apartmentId || !this.formData.itemDescription || !this.formData.amount || this.formData.amount <= 0) {
      this.error = 'Vui lòng điền đầy đủ thông tin bắt buộc';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = new FormData();
    formData.append('ApartmentId', this.formData.apartmentId);
    if (this.formData.priceQuotationId && this.formData.priceQuotationId !== 'custom') {
      formData.append('PriceQuotationId', this.formData.priceQuotationId);
    }
    formData.append('ItemDescription', this.formData.itemDescription);
    formData.append('Amount', this.formData.amount.toString());
    if (this.formData.note) {
      formData.append('Note', this.formData.note);
    }
    
    this.selectedFiles.forEach((file, index) => {
      formData.append(`Images`, file);
    });

    this.invoiceService.createOneTimeInvoice(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded) {
          // Emit success event and close dialog
          this.closeDialog(true);
        } else {
          this.error = response.message || 'Có lỗi xảy ra khi tạo hóa đơn';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Có lỗi xảy ra khi tạo hóa đơn';
      }
    });
  }

  closeDialog(result: boolean = false): void {
    this.closeEvent.emit(result);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}

