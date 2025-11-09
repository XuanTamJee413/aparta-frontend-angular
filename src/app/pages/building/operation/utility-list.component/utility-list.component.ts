// src/app/pages/admin/building/operation/utility-list/utility-list.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { UtilityCreateDto, UtilityDto, UtilityUpdateDto, PagedList, ServiceQueryParameters } from '../../../../models/utility.model';
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

  // Trạng thái
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
      status: ['Available', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUtilities();
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
    this.utilityForm.reset({
      name: '',
      location: '',
      periodTime: 1,
      status: 'Available'
    });
    this.dialog.nativeElement.showModal();
  }

  // === DIALOG: Sửa ===
  openEditModal(utility: UtilityDto): void {
    this.isEditMode = true;
    this.currentUtilityId = utility.utilityId;
    this.utilityForm.patchValue({
      name: utility.name,
      location: utility.location,
      periodTime: utility.periodTime,
      status: utility.status
    });
    this.dialog.nativeElement.showModal();
  }

  hideDialog(): void {
    this.dialog.nativeElement.close();
  }

  onDialogClose(): void {
    this.utilityForm.reset();
    this.currentUtilityId = null;
  }

  // === LƯU (Thêm / Cập nhật) ===
  saveUtility(): void {
    if (this.utilityForm.invalid) {
      this.utilityForm.markAllAsTouched();
      return;
    }

    const formValue = this.utilityForm.value;

    if (this.isEditMode && this.currentUtilityId) {
      // Cập nhật
      const updateDto: UtilityUpdateDto = {
        name: formValue.name,
        location: formValue.location,
        periodTime: formValue.periodTime,
        status: formValue.status
      };

      this.utilityService.updateUtility(this.currentUtilityId, updateDto).subscribe({
        next: () => {
          this.loadUtilities();
          this.hideDialog();
        },
        error: (err) => console.error('Lỗi khi cập nhật tiện ích:', err)
      });
    } else {
      // Thêm mới
      const createDto: UtilityCreateDto = {
        name: formValue.name,
        location: formValue.location,
        periodTime: formValue.periodTime,
        status: formValue.status
      };

      this.utilityService.addUtility(createDto).subscribe({
        next: () => {
          this.loadUtilities();
          this.hideDialog();
        },
        error: (err) => console.error('Lỗi khi thêm tiện ích:', err)
      });
    }
  }

  // === XÓA ===
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

  // === Hiển thị nhãn trạng thái ===
  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(o => o.value === status);
    return option ? option.label : status;
  }
}