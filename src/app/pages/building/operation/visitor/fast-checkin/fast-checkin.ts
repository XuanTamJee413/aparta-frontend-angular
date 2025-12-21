import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { VisitorCreateDto, VisitorService, ApartmentDto } from '../../../../../services/resident/visitor.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-fast-checkin',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './fast-checkin.html',
  styleUrl: './fast-checkin.css'
})
export class FastCheckin implements OnInit {
  
  manualVisitorForm!: FormGroup;
  apartmentList: ApartmentDto[] = [];
  
  // Logic Search cho Combobox
  filteredApartments: ApartmentDto[] = [];
  searchControl = new FormControl('');

  @Output() checkinSuccess = new EventEmitter<string>();
  @Output() closeForm = new EventEmitter<void>();

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';
  private alertTimeout: any;

  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
  this.manualVisitorForm = this.fb.group({
    // Họ tên: Bắt buộc, tối đa 255 ký tự, không ký tự đặc biệt (chỉ chữ, số, khoảng trắng)
    fullName: ['', [
      Validators.required,
      Validators.maxLength(255),
      Validators.pattern(/^[\p{L}0-9\s]+$/u) // Thêm cờ 'u' để hỗ trợ unicode tiếng Việt
    ]],

    // SĐT: Từ 10 đến 13 số
    phone: ['', [
      Validators.pattern(/^[0-9]{10,13}$/)
    ]],

    // CCCD: Bắt buộc, tối đa 20 ký tự, chỉ chứa số
    idNumber: ['', [
      Validators.required,
      Validators.maxLength(20),
      Validators.pattern(/^[0-9]+$/)
    ]],

    // Mục đích: Tối đa 500 ký tự, cho phép chữ, số, dấu phẩy, chấm, gạch ngang
    purpose: ['', [
      Validators.maxLength(500),
      Validators.pattern(/^[\p{L}0-9\s,.-]+$/u)
    ]],

    // Căn hộ: Bắt buộc
    apartmentId: ['', Validators.required]
  });

  this.loadApartments();

  this.searchControl.valueChanges.subscribe(value => {
    this.filterApartments(value || '');
  });
}

  loadApartments(): void {
    this.visitorService.getAllApartments().subscribe({
      next: (data) => {
        this.apartmentList = data.sort((a, b) => a.code.localeCompare(b.code));
        this.filteredApartments = this.apartmentList; // Ban đầu hiển thị tất cả
      },
      error: (err) => {
        console.error('Lỗi tải danh sách căn hộ', err);
        this.showAlert('Không thể tải danh sách căn hộ', 'danger');
      }
    });
  }

  filterApartments(searchText: string) {
    const filterValue = searchText.toLowerCase();
    this.filteredApartments = this.apartmentList.filter(apt => 
      apt.code.toLowerCase().includes(filterValue)
    );
  }

  // Ngăn chặn việc đóng select khi click vào ô input search
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  onManualSubmit(): void {
    if (this.manualVisitorForm.invalid) return;

    const dto: VisitorCreateDto = {
      ...this.manualVisitorForm.value,
      checkinTime: new Date().toISOString(), 
      status: 'Checked-in' 
    };

    this.visitorService.createVisitor(dto).subscribe({
      next: (createdVisitor) => {
        this.checkinSuccess.emit(createdVisitor.fullName);
        this.resetManualForm();
      },
      error: (err) => {
        this.showAlert(err.error?.message || 'Lỗi: Không thể đăng ký khách.', 'danger');
      }
    });
  }

  resetManualForm(): void {
    this.manualVisitorForm.reset();
    this.searchControl.setValue('');
  }

  onClose(): void {
    this.resetManualForm();
    this.closeForm.emit(); 
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => this.alertMessage = null, 5000);
  }
}