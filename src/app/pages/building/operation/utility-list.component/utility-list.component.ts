// src/app/pages/admin/building/operation/utility-list/utility-list.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityCreateDto, UtilityDto, UtilityUpdateDto } from '../../../../models/utility.model';
import { UtilityService } from '../../../../services/operation/utility.service';


@Component({
  selector: 'app-utility-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './utility-list.component.html',
  styleUrls: ['./utility-list.component.css']
})
export class UtilityListComponent implements OnInit {

  @ViewChild('utilityDialog') dialog!: ElementRef<HTMLDialogElement>;

  utilities: UtilityDto[] = []; // Đổi tên biến
  
  isEditMode: boolean = false;
  currentUtilityId: string | null = null; // Đổi tên biến
  utilityForm: FormGroup; // Đổi tên biến

  statusOptions = [
    { label: 'Actice', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  constructor(
    private utilityService: UtilityService, // Dùng UtilityService
    private fb: FormBuilder
  ) {
    // Cập nhật Form Group
    this.utilityForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required], // Thêm location
      periodTime: [null, Validators.min(0)], // Thêm periodTime (có thể null)
      status: ['Available', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUtilities(); // Đổi tên hàm
  }

  loadUtilities(): void { // Đổi tên hàm
    this.utilityService.getUtilities().subscribe({ // Dùng utilityService
      next: (data) => { this.utilities = data; },
      error: (err) => { console.error('Lỗi khi tải tiện ích:', err); }
    });
  }

  // Mở dialog Thêm mới
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentUtilityId = null;
    this.utilityForm.reset({ // Reset các trường mới
      name: '',
      location: '',
      periodTime: null,
      status: 'Available'
    });
    this.dialog.nativeElement.showModal();
  }

  // Mở dialog Sửa
  openEditModal(utility: UtilityDto): void { // Sửa tham số
    this.isEditMode = true;
    this.currentUtilityId = utility.utilityId;
    this.utilityForm.patchValue({ // Patch các trường mới
      name: utility.name,
      location: utility.location,
      periodTime: utility.periodTime,
      status: utility.status
    });
    this.dialog.nativeElement.showModal();
  }

  // Đóng dialog
  hideDialog(): void {
    this.dialog.nativeElement.close();
  }

  // Reset form khi đóng
  onDialogClose(): void {
    this.utilityForm.reset();
  }

  // Lưu (Thêm mới hoặc Cập nhật)
  saveUtility(): void { // Đổi tên hàm
    if (this.utilityForm.invalid) {
      this.utilityForm.markAllAsTouched();
      return;
    }

    const formValue = this.utilityForm.value;

    if (this.isEditMode && this.currentUtilityId) {
      // --- CHẾ ĐỘ SỬA ---
      const updateDto: UtilityUpdateDto = {
        name: formValue.name,
        location: formValue.location, // Thêm trường
        periodTime: formValue.periodTime, // Thêm trường
        status: formValue.status
      };
      this.utilityService.updateUtility(this.currentUtilityId, updateDto).subscribe({
        next: () => {
          this.loadUtilities();
          this.hideDialog();
        },
        error: (err) => console.error('Lỗi khi cập nhật:', err)
      });
    } else {
      // --- CHẾ ĐỘ THÊM MỚI ---
      const createDto: UtilityCreateDto = {
        name: formValue.name,
        location: formValue.location, // Thêm trường
        periodTime: formValue.periodTime, // Thêm trường
        status: formValue.status
      };
      this.utilityService.addUtility(createDto).subscribe({
        next: () => {
          this.loadUtilities();
          this.hideDialog();
        },
        error: (err) => console.error('Lỗi khi thêm mới:', err)
      });
    }
  }

  // Xóa
  deleteUtility(id: string): void { // Đổi tên hàm
    if (confirm('Bạn có chắc muốn xóa tiện ích này?')) {
      this.utilityService.deleteUtility(id).subscribe({
        next: () => {
          console.log('Xóa thành công');
          this.loadUtilities();
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
        }
      });
    }
  }
}