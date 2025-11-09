// SỬA 1: Xóa 'Input'
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// SỬA 2: Thêm 'ApartmentDto' (vẫn giữ nguyên)
import { VisitorCreateDto, VisitorService, ApartmentDto } from '../../../../../services/resident/visitor.service';

@Component({
  selector: 'app-fast-checkin',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './fast-checkin.html',
  styleUrl: './fast-checkin.css'
})
export class FastCheckin implements OnInit {
  
  // --- Thuộc tính Form ---
  manualVisitorForm!: FormGroup;
  
  // SỬA 3: Xóa @Input() và biến nó thành một biến local
  apartmentList: ApartmentDto[] = [];

  // --- Outputs (Phát sự kiện ra component cha) ---
  @Output() checkinSuccess = new EventEmitter<string>();
  @Output() closeForm = new EventEmitter<void>();

  // --- Trạng thái Alert ---
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';
  private alertTimeout: any;

  // --- Constructor ---
  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService
  ) {}

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    this.manualVisitorForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [
        Validators.maxLength(15),
        Validators.pattern('^[0-9]*$')
      ]],
      idNumber: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern('^[0-9]+$')
      ]],
      purpose: [''],
      apartmentId: ['', Validators.required] 
    });

    // SỬA 4: Component con tự gọi API
    this.loadApartments();
  }

  // SỬA 5: Thêm hàm loadApartments vào component con
  loadApartments(): void {
    this.visitorService.getAllApartments().subscribe({
      next: (data) => {
        this.apartmentList = data.sort((a, b) => a.code.localeCompare(b.code));
      },
      error: (err) => {
        console.error('Lỗi tải danh sách căn hộ (trong fast-checkin)', err);
        // Hiển thị lỗi ngay trong form con
        this.showAlert('Không thể tải danh sách căn hộ', 'danger');
      }
    });
  }


  // --- (Các hàm onManualSubmit, resetManualForm, onClose, showAlert giữ nguyên) ---
  
  onManualSubmit(): void {
    if (this.manualVisitorForm.invalid) {
      this.manualVisitorForm.markAllAsTouched();
      return;
    }

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
        if (err.error && err.error.message) {
          this.showAlert(err.error.message, 'danger');
        } 
        else if (err.error && err.error.errors) {
            const firstErrorKey = Object.keys(err.error.errors)[0];
            const firstErrorMessage = err.error.errors[firstErrorKey][0];
            this.showAlert(firstErrorMessage, 'danger');
        }
        else {
          this.showAlert('Lỗi: Không thể đăng ký khách.', 'danger');
        }
        console.error(err);
      }
    });
  }

  resetManualForm(): void {
    this.manualVisitorForm.reset();
  }

  onClose(): void {
    this.resetManualForm();
    this.closeForm.emit(); 
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }
}