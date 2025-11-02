import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceDto } from '../../../../models/service.model';
import { ServiceBookingService } from '../../../../services/resident/service-booking.service';
import { ServiceBookingCreateDto } from '../../../../models/service-booking.model';

// Import service và model


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

    const bookingDto: ServiceBookingCreateDto = {
      serviceId: this.selectedService.serviceId,
      bookingDate: new Date(formValue.bookingDate).toISOString(), // Đảm bảo là ISO string
      residentNote: formValue.residentNote
    };

    this.bookingService.createBooking(bookingDto).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Successfully booked service: ${response.serviceName}!`;
        setTimeout(() => this.closeDialog(), 2000); 
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Failed to create booking.';
        this.isLoading = false;
      }
    });
  }

  // Helper lấy ISO string cho input datetime-local
  private getNowISO(): string {
    const now = new Date();
    // Trừ đi múi giờ (timezone offset) để hiển thị đúng giờ địa phương
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset);
    return localDate.toISOString().slice(0, 16); 
  }
}