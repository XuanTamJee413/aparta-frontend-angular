import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceManagementService } from '../../../../services/finance/invoice-management.service';
import { PriceQuotationService, PriceQuotationDto, ECalculationMethod } from '../../../../services/management/price-quotation.service';
import { ApartmentService, Apartment } from '../../../../services/building/apartment.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { UserService } from '../../../../services/user.service';
import { ReceiptPreviewComponent } from './receipt-preview/receipt-preview.component';

@Component({
  selector: 'app-create-one-time-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceiptPreviewComponent],
  templateUrl: './create-one-time-invoice.component.html',
  styleUrls: ['./create-one-time-invoice.component.css']
})
export class CreateOneTimeInvoiceComponent implements OnInit {
  buildings: BuildingDto[] = [];
  selectedBuildingId: string = '';
  selectedBuilding: BuildingDto | null = null;
  
  apartments: Apartment[] = [];
  priceQuotations: PriceQuotationDto[] = [];
  
  // Form data
  selectedQuotationId: string | null = null;
  payerName: string = '';
  apartmentAddress: string = '';
  itemDescription: string = '';
  amount: number = 0;
  note: string = '';
  
  // Autocomplete
  apartmentSearchText: string = '';
  showApartmentSuggestions: boolean = false;
  filteredApartments: Apartment[] = [];
  selectedApartmentId: string = '';
  
  // Images - max 3
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  readonly MAX_IMAGES = 3;
  
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  createdInvoiceId: string | null = null;

  constructor(
    private invoiceService: InvoiceManagementService,
    private priceQuotationService: PriceQuotationService,
    private apartmentService: ApartmentService,
    private buildingService: BuildingService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.buildingService.getAllBuildings({ take: 100 }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.items) {
          this.buildings = response.data.items.filter(b => b.isActive);
          if (this.buildings.length > 0 && !this.selectedBuildingId) {
            this.selectedBuildingId = this.buildings[0].buildingId;
            this.selectedBuilding = this.buildings[0];
            this.onBuildingChange();
          }
        }
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách tòa nhà';
      }
    });
  }

  onBuildingChange(): void {
    if (this.selectedBuildingId) {
      this.selectedBuilding = this.buildings.find(b => b.buildingId === this.selectedBuildingId) || null;
      this.loadApartments();
      this.loadPriceQuotations();
    }
  }

  loadApartments(): void {
    this.apartmentService.getApartments({
      buildingId: this.selectedBuildingId,
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
        // Error handled silently
      }
    });
  }

  loadPriceQuotations(): void {
    this.priceQuotationService.getPriceQuotations({
      buildingId: this.selectedBuildingId,
      pageNumber: 1,
      pageSize: 100,
      searchTerm: null,
      sortColumn: null,
      sortDirection: null
    }).subscribe({
      next: (response) => {
        if (response.items) {
          this.priceQuotations = response.items.filter(
            pq => pq.calculationMethod === ECalculationMethod.ONE_TIME
          );
        }
      },
      error: (error) => {
        // Error handled silently
      }
    });
  }

  onQuotationSelect(quotationId: string): void {
    const quotation = this.priceQuotations.find(q => q.priceQuotationId === quotationId);
    if (quotation) {
      this.selectedQuotationId = quotationId;
      this.itemDescription = quotation.feeType;
      this.amount = quotation.unitPrice;
    }
  }

  onApartmentSearchInput(): void {
    if (!this.apartmentSearchText || this.apartmentSearchText.trim() === '') {
      this.filteredApartments = [];
      this.showApartmentSuggestions = false;
      this.apartmentAddress = '';
      this.payerName = '';
      return;
    }

    const searchText = this.apartmentSearchText.toLowerCase().trim();
    this.filteredApartments = this.apartments.filter(apartment =>
      apartment.code.toLowerCase().includes(searchText)
    );
    this.showApartmentSuggestions = this.filteredApartments.length > 0;
    
    // Check for exact match and auto-fill owner name
    const exactMatch = this.apartments.find(a => 
      a.code.trim().toLowerCase() === searchText
    );
    if (exactMatch) {
      this.apartmentAddress = exactMatch.code;
      if (this.selectedApartmentId !== exactMatch.apartmentId) {
        this.selectedApartmentId = exactMatch.apartmentId;
        this.loadApartmentOwner(exactMatch.apartmentId);
      }
    } else {
      if (this.selectedApartmentId) {
        this.apartmentAddress = '';
        this.selectedApartmentId = '';
        this.payerName = '';
      } else {
        this.apartmentAddress = '';
      }
    }
  }

  selectApartment(apartment: Apartment): void {
    this.apartmentAddress = apartment.code;
    this.apartmentSearchText = apartment.code;
    this.selectedApartmentId = apartment.apartmentId;
    this.showApartmentSuggestions = false;
    
    this.loadApartmentOwner(apartment.apartmentId);
  }

  loadApartmentOwner(apartmentId: string): void {
    if (!apartmentId) {
      this.payerName = '';
      return;
    }
    
    this.userService.getUserByApartment(apartmentId).subscribe({
      next: (user) => {
        if (user?.name) {
          this.payerName = user.name;
        } else {
          this.payerName = '';
        }
      },
      error: (error: any) => {
        this.payerName = '';
      }
    });
  }

  onApartmentInputBlur(): void {
    setTimeout(() => {
      this.showApartmentSuggestions = false;
      
      if (this.apartmentSearchText && this.apartmentSearchText.trim()) {
        const searchText = this.apartmentSearchText.trim();
        const exactMatch = this.apartments.find(a => 
          a.code.trim().toLowerCase() === searchText.toLowerCase()
        );
        if (exactMatch) {
          this.apartmentAddress = exactMatch.code;
          this.apartmentSearchText = exactMatch.code;
          if (!this.payerName) {
            this.loadApartmentOwner(exactMatch.apartmentId);
          }
        }
      }
    }, 200);
  }

  onApartmentInputFocus(): void {
    if (this.apartmentSearchText) {
      this.onApartmentSearchInput();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      const totalFiles = this.selectedFiles.length + newFiles.length;
      
      if (totalFiles > this.MAX_IMAGES) {
        this.error = `Chỉ được upload tối đa ${this.MAX_IMAGES} ảnh`;
        input.value = '';
        return;
      }
      
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreviews.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
      
      this.error = null;
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.selectedBuildingId || !this.apartmentAddress || !this.payerName || !this.itemDescription || !this.amount || this.amount <= 0) {
      this.error = 'Vui lòng điền đầy đủ thông tin bắt buộc';
      return;
    }

    const apartment = this.apartments.find(a => a.code.toLowerCase() === this.apartmentAddress.toLowerCase());
    if (!apartment) {
      this.error = 'Căn hộ không hợp lệ. Vui lòng chọn từ danh sách gợi ý.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const formData = new FormData();
    formData.append('ApartmentId', apartment.apartmentId);
    if (this.selectedQuotationId && this.selectedQuotationId !== 'custom') {
      formData.append('PriceQuotationId', this.selectedQuotationId);
    }
    formData.append('ItemDescription', this.itemDescription);
    formData.append('Amount', this.amount.toString());
    if (this.note) {
      formData.append('Note', this.note);
    }
    
    this.selectedFiles.forEach((file) => {
      formData.append('Images', file);
    });

    this.invoiceService.createOneTimeInvoice(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.succeeded) {
          this.successMessage = 'Tạo hóa đơn thành công!';
          this.createdInvoiceId = response.data?.invoiceId || null;
          // Không reset form - giữ nguyên dữ liệu
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

  printInvoice(): void {
    if (this.createdInvoiceId) {
      this.router.navigate(['/manager/invoice-detail', this.createdInvoiceId]);
      // Sau khi navigate, trang invoice-detail sẽ có nút in
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatNumber(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  isApartmentValid(): boolean {
    if (!this.apartmentAddress || !this.apartmentSearchText) {
      return false;
    }
    return this.apartments.some(a => a.code.toLowerCase() === this.apartmentAddress.toLowerCase());
  }

  isSearchTextValid(): boolean {
    if (!this.apartmentSearchText) {
      return false;
    }
    return this.apartments.some(a => a.code.toLowerCase() === this.apartmentSearchText.toLowerCase());
  }
}
