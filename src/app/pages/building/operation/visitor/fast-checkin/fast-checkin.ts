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
  manualVisitorForm!: FormGroup;
  
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
      fullName: ['', Validators.required],
      phone: [''],
      idNumber: ['', Validators.required],
      purpose: [''],
      apartmentId: ['', Validators.required]
    });
  }

  onManualSubmit(): void {
    if (this.manualVisitorForm.invalid) {
      this.manualVisitorForm.markAllAsTouched();
      return;
    }

    const dto: VisitorCreateDto = {
      ...this.manualVisitorForm.value,
      checkinTime: new Date().toISOString()
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
    }, 3000);
  }
}