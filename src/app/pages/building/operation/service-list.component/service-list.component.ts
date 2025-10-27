import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ServiceDto, PagedList, ServiceQueryParameters, ServiceUpdateDto, ServiceCreateDto } from '../../../../models/service.model';
import { ServiceService } from '../../../../services/operation/service.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
  ],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {

  @ViewChild('serviceDialog') dialog!: ElementRef<HTMLDialogElement>;

  services: ServiceDto[] = [];
  isEditMode: boolean = false;
  currentServiceId: string | null = null;
  serviceForm: FormGroup; 

  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  searchControl = new FormControl('');
  statusFilterControl = new FormControl('');

  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Available', value: 'Available' },
    { label: 'Unavailable', value: 'Unavailable' }
  ];
  dialogStatusOptions = this.statusOptions.filter(o => o.value !== '');

  constructor(
    private serviceService: ServiceService,
    private fb: FormBuilder
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['Available', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    const params: ServiceQueryParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || null,
      status: this.statusFilterControl.value || null
    };

    this.serviceService.getServices(params).subscribe({
      next: (data: PagedList<ServiceDto>) => {
        this.services = data.items;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.currentPage = data.pageNumber;
      },
      error: (err) => { console.error('Lỗi khi tải dịch vụ:', err); }
    });
  }

  onSearch(): void {
    this.currentPage = 1; 
    this.loadServices();
  }

  onFilterChange(): void {
    this.currentPage = 1; 
    this.loadServices();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadServices();
    }
  }

  // Hàm helper này không còn được dùng trong HTML, nhưng bạn có thể giữ lại
  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }
  // ... (code của bạn)

  // 🔽 THÊM 2 HÀM GET NÀY VÀO 🔽

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  // --- Các hàm Dialog (Cập nhậtเล็กน้อย) ---
// ... (code còn lại)

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentServiceId = null;
    this.serviceForm.reset({
      name: '',
      price: 0,
      status: 'Available'
    });
    this.dialog.nativeElement.showModal();
  }

  openEditModal(service: ServiceDto): void {
    this.isEditMode = true;
    this.currentServiceId = service.serviceId;
    this.serviceForm.patchValue({
      name: service.name,
      price: service.price,
      status: service.status
    });
    this.dialog.nativeElement.showModal();
  }

  hideDialog(): void {
    this.dialog.nativeElement.close();
  }

  onDialogClose(): void {
    this.serviceForm.reset();
  }

  // 🔽 SỬA LỖI TRONG HÀM NÀY 🔽
  saveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const formValue = this.serviceForm.value;

    if (this.isEditMode && this.currentServiceId) {
      // SỬA LỖI 1: Khởi tạo DTO trực tiếp từ formValue
      const updateDto: ServiceUpdateDto = {
        name: formValue.name,
        price: formValue.price,
        status: formValue.status
      };

      this.serviceService.updateService(this.currentServiceId, updateDto).subscribe({
        next: () => {
          this.loadServices(); 
          this.hideDialog();
        },
        error: (err) => console.error('Lỗi khi cập nhật:', err)
      });
    } else {
      // SỬA LỖI 2: Khởi tạo DTO trực tiếp từ formValue
      const createDto: ServiceCreateDto = {
        name: formValue.name,
        price: formValue.price,
        status: formValue.status
      };

      this.serviceService.addService(createDto).subscribe({
        next: () => {
          this.loadServices(); 
          this.hideDialog();
        },
        error: (err) => console.error('Lỗi khi thêm mới:', err)
      });
    }
  }

  // 🔽 SỬA LỖI TRONG HÀM NÀY 🔽
  delete(id: string): void {
    if (confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      this.serviceService.deleteService(id).subscribe({
        next: () => {
          console.log('Xóa thành công');
          
          // SỬA LỖI 3: Chỉ gọi loadServices() MỘT LẦN
          
          // Xử lý logic phân trang trước
          if (this.services.length === 1 && this.currentPage > 1) {
             this.currentPage--;
          }
          
          // Sau đó mới tải lại dữ liệu
          this.loadServices(); 
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
        }
      });
    }
  }
  
}