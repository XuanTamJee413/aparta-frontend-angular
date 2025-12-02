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
  endDate: string | null = null;
  isSuccess: boolean = false;

  constructor(
    private invoiceService: InvoiceManagementService,
    private priceQuotationService: PriceQuotationService,
    private apartmentService: ApartmentService,
    private buildingService: BuildingService,
    private userService: UserService,
    private router: Router
  ) {}

  // Khởi tạo component - Tự động tải danh sách tòa nhà khi component được load
  ngOnInit(): void {
    this.loadBuildings();
  }

  // Tải danh sách tòa nhà từ API - Chỉ lấy các tòa nhà đang hoạt động (isActive = true) - Tự động chọn tòa nhà đầu tiên nếu chưa có tòa nhà nào được chọn
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

  // Xử lý khi người dùng thay đổi tòa nhà được chọn - Tự động tải lại danh sách căn hộ và bảng giá của tòa nhà mới
  onBuildingChange(): void {
    if (this.selectedBuildingId) {
      this.selectedBuilding = this.buildings.find(b => b.buildingId === this.selectedBuildingId) || null;
      this.loadApartments();
      this.loadPriceQuotations();
    }
  }

  // Tải danh sách căn hộ của tòa nhà được chọn - Chỉ lấy các căn hộ có trạng thái "Đã Bán"
  loadApartments(): void {
    this.apartmentService.getApartments({
      buildingId: this.selectedBuildingId,
      status: 'Đã Bán',
      searchTerm: null,
      sortBy: null,
      sortOrder: null
    }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.apartments = response.data;
        } else {
          this.apartments = [];
        }
      },
      error: (error) => {
        this.apartments = [];
      }
    });
  }

  // Tải danh sách bảng giá của tòa nhà được chọn - Chỉ lấy các bảng giá có phương thức tính là "Một lần" (ONE_TIME)
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

  // Xử lý khi người dùng chọn một loại thu từ bảng giá - Tự động điền mô tả khoản thu và số tiền từ bảng giá được chọn
  onQuotationSelect(quotationId: string): void {
    const quotation = this.priceQuotations.find(q => q.priceQuotationId === quotationId);
    if (quotation) {
      this.selectedQuotationId = quotationId;
      this.itemDescription = quotation.feeType;
      this.amount = quotation.unitPrice;
    }
  }

  // Xử lý khi người dùng nhập mã căn hộ vào ô tìm kiếm - Hiển thị danh sách gợi ý căn hộ phù hợp - Tự động điền thông tin nếu tìm thấy căn hộ chính xác
  onApartmentSearchInput(): void {
    if (!this.apartmentSearchText || this.apartmentSearchText.trim() === '') {
      this.filteredApartments = [];
      this.showApartmentSuggestions = false;
      this.apartmentAddress = '';
      this.payerName = '';
      return;
    }

    const searchText = this.apartmentSearchText.trim().toLowerCase();
    this.filteredApartments = this.apartments.filter(apartment =>
      apartment.code?.trim().toLowerCase().includes(searchText)
    );
    this.showApartmentSuggestions = this.filteredApartments.length > 0;
    
    // Check for exact match and auto-fill owner name
    const exactMatch = this.apartments.find(a => 
      a.code?.trim().toLowerCase() === searchText
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

  // Xử lý khi người dùng chọn một căn hộ từ danh sách gợi ý - Tự động điền mã căn hộ và tải thông tin chủ sở hữu
  selectApartment(apartment: Apartment): void {
    this.apartmentAddress = apartment.code;
    this.apartmentSearchText = apartment.code;
    this.selectedApartmentId = apartment.apartmentId;
    this.showApartmentSuggestions = false;
    
    this.loadApartmentOwner(apartment.apartmentId);
  }

  // Tải thông tin chủ sở hữu căn hộ từ API - Tự động điền tên chủ sở hữu vào trường "Họ tên"
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

  // Xử lý khi người dùng rời khỏi ô nhập mã căn hộ (blur event) - Kiểm tra và tự động điền thông tin nếu mã căn hộ hợp lệ
  onApartmentInputBlur(): void {
    setTimeout(() => {
      this.showApartmentSuggestions = false;
      
      if (this.apartmentSearchText && this.apartmentSearchText.trim()) {
        const searchText = this.apartmentSearchText.trim().toLowerCase();
        const exactMatch = this.apartments.find(a => 
          a.code?.trim().toLowerCase() === searchText
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

  // Xử lý khi người dùng focus vào ô nhập mã căn hộ - Hiển thị lại danh sách gợi ý nếu đã có text
  onApartmentInputFocus(): void {
    if (this.apartmentSearchText) {
      this.onApartmentSearchInput();
    }
  }

  // Xử lý khi người dùng chọn file ảnh để upload - Kiểm tra số lượng ảnh (tối đa 3 ảnh) - Tạo preview cho các ảnh đã chọn
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

  // Xóa một ảnh đã upload khỏi danh sách
  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // Xử lý khi người dùng submit form tạo phiếu thu - Validate dữ liệu, tạo hóa đơn, lưu snapshot và tự động tạo PDF
  onSubmit(): void {
    if (!this.selectedBuildingId || !this.apartmentAddress || !this.payerName || !this.itemDescription || !this.amount || this.amount <= 0) {
      this.error = 'Vui lòng điền đầy đủ thông tin bắt buộc';
      return;
    }

    const searchCode = this.apartmentAddress.trim().toLowerCase();
    const apartment = this.apartments.find(a => a.code?.trim().toLowerCase() === searchCode);
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
          this.endDate = response.data?.endDate || null;
          this.createdInvoiceId = response.data?.invoiceId || null;
          
          // Hiển thị thông báo thành công trên button
          this.isSuccess = true;
          this.successMessage = 'Thành công! Tạo phiếu thu thành công!';
          this.error = null;
          
          // Reset form nhưng giữ nguyên message thành công
          this.resetFormKeepMessage();
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

  // Reset toàn bộ form về trạng thái ban đầu - Xóa tất cả dữ liệu đã nhập, ảnh đã upload
  resetForm(): void {
    // Reset form data
    this.selectedQuotationId = null;
    this.payerName = '';
    this.apartmentAddress = '';
    this.apartmentSearchText = '';
    this.selectedApartmentId = '';
    this.itemDescription = '';
    this.amount = 0;
    this.note = '';
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.createdInvoiceId = null;
    this.endDate = null;
    this.error = null;
    this.successMessage = null;
    this.isSuccess = false;
  }

  // Reset form nhưng giữ nguyên message thành công
  resetFormKeepMessage(): void {
    // Reset form data
    this.selectedQuotationId = null;
    this.payerName = '';
    this.apartmentAddress = '';
    this.apartmentSearchText = '';
    this.selectedApartmentId = '';
    this.itemDescription = '';
    this.amount = 0;
    this.note = '';
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.createdInvoiceId = null;
    this.endDate = null;
    this.error = null;
    // Giữ nguyên successMessage và isSuccess
  }

  // Format số tiền thành định dạng tiền tệ Việt Nam (VND) - Ví dụ: 1000000 -> "1.000.000 ₫"
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Format số thành định dạng Việt Nam (có dấu phẩy ngăn cách hàng nghìn) - Ví dụ: 1000000 -> "1.000.000"
  formatNumber(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  // Kiểm tra xem địa chỉ căn hộ đã nhập có hợp lệ không - Căn hộ phải tồn tại trong danh sách căn hộ của tòa nhà
  isApartmentValid(): boolean {
    if (!this.apartmentAddress || !this.apartmentSearchText) {
      return false;
    }
    const searchCode = this.apartmentAddress.trim().toLowerCase();
    return this.apartments.some(a => a.code?.trim().toLowerCase() === searchCode);
  }

  // Kiểm tra xem text đã nhập trong ô tìm kiếm căn hộ có hợp lệ không - Sử dụng để hiển thị thông báo lỗi nếu căn hộ không tồn tại
  isSearchTextValid(): boolean {
    if (!this.apartmentSearchText) {
      return false;
    }
    const searchCode = this.apartmentSearchText.trim().toLowerCase();
    const isValid = this.apartments.some(a => a.code?.trim().toLowerCase() === searchCode);
    return isValid;
  }
}
