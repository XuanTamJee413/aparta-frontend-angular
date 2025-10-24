import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; // 1. Thêm ViewChild, ElementRef
import { CommonModule } from '@angular/common';
// 2. Vẫn cần ReactiveFormsModule
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { ServiceCreateDto, ServiceDto, ServiceUpdateDto } from '../../../../models/service.model';
import { ServiceService } from '../../../../services/operation/service.service';


// 3. Xóa tất cả import của PrimeNG

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // 4. Giữ lại ReactiveFormsModule
  ],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {

  // 5. Lấy tham chiếu đến thẻ <dialog> trong HTML
  @ViewChild('serviceDialog') dialog!: ElementRef<HTMLDialogElement>;

  services: ServiceDto[] = [];
  
  isEditMode: boolean = false;
  currentServiceId: string | null = null;
  serviceForm: FormGroup; 

  statusOptions = [
    { label: 'Actice', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

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
    this.serviceService.getServices().subscribe({
      next: (data) => { this.services = data; },
      error: (err) => { console.error('Lỗi khi tải dịch vụ:', err); }
    });
  }

  // 6. Sửa hàm mở Dialog
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentServiceId = null;
    this.serviceForm.reset({
      name: '',
      price: 0,
      status: 'Active'
    });
    this.dialog.nativeElement.showModal(); // Dùng .showModal()
  }

  // 7. Sửa hàm mở Dialog
  openEditModal(service: ServiceDto): void {
    this.isEditMode = true;
    this.currentServiceId = service.serviceId;
    this.serviceForm.patchValue({
      name: service.name,
      price: service.price,
      status: service.status
    });
    this.dialog.nativeElement.showModal(); // Dùng .showModal()
  }

  // 8. Sửa hàm đóng Dialog
  hideDialog(): void {
    this.dialog.nativeElement.close(); // Dùng .close()
  }

  // 9. HÀM BẠN ĐANG THIẾU LÀ ĐÂY:
  // Hàm này để reset form khi dialog bị đóng (ví dụ: nhấn Esc)
  onDialogClose(): void {
    this.serviceForm.reset();
  }

  // 10. Sửa hàm Save
  saveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const formValue = this.serviceForm.value;

    if (this.isEditMode && this.currentServiceId) {
      // --- CHẾ ĐỘ SỬA ---
      const updateDto: ServiceUpdateDto = {
        name: formValue.name,
        price: formValue.price,
        status: formValue.status
      };
      this.serviceService.updateService(this.currentServiceId, updateDto).subscribe({
        next: () => {
          this.loadServices();
          this.hideDialog(); // Gọi hàm đóng
        },
        error: (err) => console.error('Lỗi khi cập nhật:', err)
      });
    } else {
      // --- CHẾ ĐỘ THÊM MỚI ---
      const createDto: ServiceCreateDto = {
        name: formValue.name,
        price: formValue.price,
        status: formValue.status
      };
      this.serviceService.addService(createDto).subscribe({
        next: () => {
          this.loadServices();
          this.hideDialog(); // Gọi hàm đóng
        },
        error: (err) => console.error('Lỗi khi thêm mới:', err)
      });
    }
  }

  // Hàm Xóa (giữ nguyên)
  delete(id: string): void {
    if (confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      this.serviceService.deleteService(id).subscribe({
        next: () => {
          console.log('Xóa thành công');
          this.loadServices();
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
        }
      });
    }
  }
}