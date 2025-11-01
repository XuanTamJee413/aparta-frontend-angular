import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitorCreateDto, VisitorService } from '../../../../../services/resident/visitor.service';

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
    // Khởi tạo form
    this.manualVisitorForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: [''],
      idNumber: ['', Validators.required],
      purpose: [''],
      apartmentId: ['', Validators.required] // Staff phải nhập mã căn hộ
    });
  }

  // --- Xử lý Form ---

  /** Xử lý khi submit form */
  onManualSubmit(): void {
    if (this.manualVisitorForm.invalid) {
      this.manualVisitorForm.markAllAsTouched();
      return;
    }

    // Tạo DTO
    const dto: VisitorCreateDto = {
      ...this.manualVisitorForm.value,
      checkinTime: new Date().toISOString(), // Check-in ngay lập tức
      status: 'Checked-in' // Trạng thái là "Checked-in" luôn
    };

    // Gọi service
    this.visitorService.createVisitor(dto).subscribe({
      next: (createdVisitor) => {
        // Bắn sự kiện thành công về component cha
        this.checkinSuccess.emit(createdVisitor.fullName);
        this.resetManualForm();
      },
      error: (err) => {
        // Xử lý lỗi validation từ API
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

  /** Reset form về trạng thái ban đầu */
  resetManualForm(): void {
    this.manualVisitorForm.reset();
  }

  // --- Xử lý UI ---

  /** Đóng form và bắn sự kiện về component cha */
  onClose(): void {
    this.resetManualForm();
    this.closeForm.emit(); 
  }

  /** Hiển thị thông báo (alert) */
  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => {
      this.alertMessage = null;
    }, 3000);
  }
}