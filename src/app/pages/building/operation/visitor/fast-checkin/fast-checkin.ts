import { Component, OnInit, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './fast-checkin.html',
  styleUrl: './fast-checkin.css'
})
export class FastCheckin implements OnInit {
  isDuplicateVisitor = false;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
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
    private visitorService: VisitorService,
    private dialog: MatDialog
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
this.manualVisitorForm.get('idNumber')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(val => {
      if (val && val.length >= 10) { // Check khi đủ độ dài số CCCD
        this.visitorService.checkVisitorExist(val).subscribe(res => {
          if (res.exists) {
            this.isDuplicateVisitor = true;
            // Auto-fill thông tin cũ cho Staff đỡ phải nhập lại
            this.manualVisitorForm.patchValue({
              fullName: res.fullName,
              phone: res.phone
            }, { emitEvent: false });
          } else {
            this.isDuplicateVisitor = false;
          }
        });
      } else {
        this.isDuplicateVisitor = false;
      }
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

    if (this.isDuplicateVisitor) {
      const dialogRef = this.dialog.open(this.confirmDialog, {
        width: '400px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.executeSubmit();
        }
      });
    } else {
      this.executeSubmit();
    }
  }

  private executeSubmit(): void {
    const dto: VisitorCreateDto = {
      ...this.manualVisitorForm.value,
      checkinTime: new Date().toISOString(),
      status: 'Checked-in'
    };

    this.visitorService.createVisitor(dto).subscribe({
      next: (createdVisitor) => {
        // Thông báo nếu có cập nhật thông tin khách cũ
        const successMsg = createdVisitor.isUpdated ? 'Cập nhật & Check-in thành công' : 'Check-in thành công';
        this.checkinSuccess.emit(createdVisitor.fullName);
        this.resetManualForm();
        this.isDuplicateVisitor = false;
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