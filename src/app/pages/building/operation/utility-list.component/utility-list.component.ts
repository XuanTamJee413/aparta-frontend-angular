import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

// Import thêm BuildingSimpleDto
import { UtilityCreateDto, UtilityDto, UtilityUpdateDto, PagedList, ServiceQueryParameters, BuildingSimpleDto } from '../../../../models/utility.model';
import { UtilityService } from '../../../../services/operation/utility.service';

@Component({
  selector: 'app-utility-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './utility-list.component.html',
  styleUrls: ['./utility-list.component.css']
})
export class UtilityListComponent implements OnInit {

  @ViewChild('utilityDialog') dialog!: ElementRef<HTMLDialogElement>;

  utilities: UtilityDto[] = [];
  buildings: BuildingSimpleDto[] = []; // Danh sách tòa nhà để chọn
  
  isEditMode = false;
  currentUtilityId: string | null = null;
  utilityForm: FormGroup;
  isLoading = false;

  // Phân trang
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Tìm kiếm & lọc
  searchControl = new FormControl('');
  statusFilterControl = new FormControl('');

  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Hoạt động', value: 'Available' },
    { label: 'Ngừng hoạt động', value: 'Unavailable' }
  ];

  dialogStatusOptions = this.statusOptions.filter(o => o.value !== '');

  constructor(
    private utilityService: UtilityService,
    private fb: FormBuilder
  ) {
    this.utilityForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      periodTime: [1, [Validators.required, Validators.min(1)]],
      status: ['Available', Validators.required],
      openTime: ['06:00'],
      closeTime: ['22:00'],
      buildingId: ['', Validators.required] // <--- THÊM VALIDATOR BẮT BUỘC
    });
  }

  ngOnInit(): void {
    this.loadMyBuildings(); // Load danh sách tòa nhà trước
    this.loadUtilities();
  }

  // utility-list.component.ts
loadMyBuildings(): void {
  this.utilityService.getMyBuildings().subscribe({
    next: (response) => {
      // Nếu API trả về ApiResponse wrapper
      this.buildings = response.data || []; 
      
      // Nếu bạn đã map ở service thì chỉ cần:
      // this.buildings = response;
    },
    error: (err) => console.error('Lỗi tải danh sách tòa nhà:', err)
  });
}

  loadUtilities(): void {
    this.isLoading = true;
    const params: ServiceQueryParameters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value?.trim() || null,
      status: this.statusFilterControl.value || null
    };

    this.utilityService.getUtilities(params).subscribe({
      next: (data: PagedList<UtilityDto>) => {
        this.utilities = data.items;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
        this.currentPage = data.pageNumber;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải tiện ích:', err);
        this.isLoading = false;
      }
    });
  }

  // ... (Giữ nguyên các hàm onSearch, onFilterChange, onPageChange, getter page)

  onSearch(): void {
    this.currentPage = 1;
    this.loadUtilities();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUtilities();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUtilities();
    }
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  // === DIALOG: Thêm mới ===
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentUtilityId = null;
    
    // Enable lại buildingId khi thêm mới
    this.utilityForm.get('buildingId')?.enable();

    // Nếu chỉ có 1 tòa nhà, set default luôn
    const defaultBuilding = this.buildings.length === 1 ? this.buildings[0].buildingId : '';

    this.utilityForm.reset({
      name: '',
      location: '',
      periodTime: 1,
      status: 'Available',
      openTime: '06:00',
      closeTime: '22:00',
      buildingId: defaultBuilding
    });
    this.dialog.nativeElement.showModal();
  }

  // === DIALOG: Sửa ===
  openEditModal(utility: UtilityDto): void {
    this.isEditMode = true;
    this.currentUtilityId = utility.utilityId;
    
    const formatTime = (time: string | null) => time ? time.substring(0, 5) : null;

    this.utilityForm.patchValue({
      name: utility.name,
      location: utility.location,
      periodTime: utility.periodTime,
      status: utility.status,
      openTime: formatTime(utility.openTime),
      closeTime: formatTime(utility.closeTime),
      buildingId: utility.buildingId // Map buildingId
    });

    // Thường thì không cho sửa tòa nhà của tiện ích đã tạo -> Disable
    this.utilityForm.get('buildingId')?.disable();

    this.dialog.nativeElement.showModal();
  }

  hideDialog(): void {
    this.dialog.nativeElement.close();
  }

  onDialogClose(): void {
    this.utilityForm.reset();
    this.currentUtilityId = null;
    this.utilityForm.get('buildingId')?.enable(); // Reset trạng thái enable
  }

  // === LƯU ===
  saveUtility(): void {
    if (this.utilityForm.invalid) {
      this.utilityForm.markAllAsTouched();
      return;
    }

    const formValue = this.utilityForm.getRawValue(); // getRawValue để lấy cả field bị disabled
    
    const payload = {
      name: formValue.name,
      location: formValue.location,
      periodTime: formValue.periodTime,
      status: formValue.status,
      openTime: formValue.openTime ? formValue.openTime + ':00' : null,
      closeTime: formValue.closeTime ? formValue.closeTime + ':00' : null,
      buildingId: formValue.buildingId // Gửi kèm BuildingId
    };

    if (this.isEditMode && this.currentUtilityId) {
      // Khi update, Backend thường bỏ qua buildingId, nhưng ta cứ gửi hoặc mapping sang Dto update ko có field đó
      this.utilityService.updateUtility(this.currentUtilityId, payload as UtilityUpdateDto).subscribe({
        next: () => {
          this.loadUtilities();
          this.hideDialog();
        },
        error: (err) => alert('Lỗi cập nhật: ' + (err.error?.message || 'Không xác định'))
      });
    } else {
      this.utilityService.addUtility(payload as UtilityCreateDto).subscribe({
        next: () => {
          this.loadUtilities();
          this.hideDialog();
        },
        error: (err) => alert('Lỗi thêm mới: ' + (err.error?.message || 'Không xác định'))
      });
    }
  }

  // ... (Hàm delete và getStatusLabel giữ nguyên)
  deleteUtility(id: string): void {
    if (confirm('Bạn có chắc muốn xóa tiện ích này?')) {
      this.utilityService.deleteUtility(id).subscribe({
        next: () => {
          if (this.utilities.length === 1 && this.currentPage > 1) {
            this.currentPage--;
          }
          this.loadUtilities();
        },
        error: (err) => console.error('Lỗi khi xóa tiện ích:', err)
      });
    }
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : status;
  }
  
  // Helper để lấy tên tòa nhà hiển thị lên bảng (nếu cần)
  getBuildingName(id: string | null): string {
    if (!id) return '---';
    const b = this.buildings.find(x => x.buildingId === id);
    return b ? b.name : id; // Nếu không tìm thấy tên thì hiện ID
  }
}