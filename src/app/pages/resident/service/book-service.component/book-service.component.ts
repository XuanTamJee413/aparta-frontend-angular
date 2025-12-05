import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ServiceDto } from '../../../../models/service.model';
import { ServiceBookingCreateDto, ServiceBookingDto } from '../../../../models/service-booking.model';

import { ServiceBookingService } from '../../../../services/resident/service-booking.service';

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-service.component.html',
  styleUrls: ['./book-service.component.css']
})
export class BookServiceComponent implements OnInit {

  @ViewChild('bookingDialog') dialog!: ElementRef<HTMLDialogElement>;

  availableServices: ServiceDto[] = [];
  bookingForm: FormGroup;
  selectedService: ServiceDto | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  myBookings: ServiceBookingDto[] = [];
  isHistoryLoading = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: ServiceBookingService
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: [this.getNowISO(), Validators.required],
      residentNote: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableServices();
    this.loadHistory();
  }

  loadAvailableServices(): void {
    this.isLoading = true;
    this.bookingService.getAvailableServices().subscribe({
      next: (data) => {
        this.availableServices = data.items;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load services.';
        this.isLoading = false;
      }
    });
  }

  openBookingModal(service: ServiceDto): void {
    this.selectedService = service;
    this.bookingForm.reset({
      bookingDate: this.getNowISO(),
      residentNote: ''
    });
    this.errorMessage = '';
    this.successMessage = '';
    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.selectedService = null;
  }

  onSubmitBooking(): void {
    if (this.bookingForm.invalid || !this.selectedService) {
      return;
    }

    this.isLoading = true;
    const formValue = this.bookingForm.value;
    const serviceName = this.selectedService.name;

    const bookingDto: ServiceBookingCreateDto = {
      serviceId: this.selectedService.serviceId,
      bookingDate: new Date(formValue.bookingDate).toISOString(),
      residentNote: formValue.residentNote
    };

    this.bookingService.createBooking(bookingDto).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Đặt dịch vụ "${serviceName}" thành công!`;
        
        setTimeout(() => {
          this.closeDialog();
          this.successMessage = '';
        }, 1500);

        this.loadHistory();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Lỗi khi đặt dịch vụ.';
        this.isLoading = false;
      }
    });
  }

  loadHistory(): void {
    this.isHistoryLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings = data;
        this.isHistoryLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isHistoryLoading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const map: { [key: string]: string } = {
      Pending: 'Chờ duyệt',
      Approved: 'Đã duyệt',
      Rejected: 'Bị từ chối',
      Cancelled: 'Đã hủy'
    };
    return map[status] || status;
  }

  private getNowISO(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset);
    return localDate.toISOString().slice(0, 16); 
  }
}