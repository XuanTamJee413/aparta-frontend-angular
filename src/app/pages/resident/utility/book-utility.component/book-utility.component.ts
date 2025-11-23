import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// Import Models
import { UtilityDto } from '../../../../models/utility.model';
import { BookedSlotDto, UtilityBookingCreateDto, UtilityQueryParameters } from '../../../../models/utility-booking.model';

// Import Services
import { UtilityService } from '../../../../services/operation/utility.service';
import { UtilityBookingService } from '../../../../services/resident/utility-booking.service'; 

@Component({
  selector: 'app-book-utility',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-utility.component.html',
  styleUrls: ['./book-utility.component.css']
})
export class BookUtilityComponent implements OnInit {

  @ViewChild('bookingDialog') dialog!: ElementRef<HTMLDialogElement>;

  utilities: UtilityDto[] = [];
  selectedUtility: UtilityDto | null = null;
  bookingForm: FormGroup;
  
  isLoading = false;
  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  // Thêm biến cho logic hiển thị slot bận
  bookedSlots: BookedSlotDto[] = []; 
  selectedDate: string = '';

  constructor(
    private utilityService: UtilityService,
    private bookingService: UtilityBookingService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: ['', Validators.required], 
      bookedAt: ['', Validators.required],    
      residentNote: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableUtilities();
  }

  loadAvailableUtilities(): void {
    const params: UtilityQueryParameters = {
      pageNumber: 1,
      pageSize: 100,
      status: 'Available'
    };

    this.utilityService.getUtilities(params).subscribe({
      next: (data) => {
        this.utilities = data.items;
      },
      error: (err) => console.error('Lỗi tải tiện ích:', err)
    });
  }

  openBookingModal(utility: UtilityDto): void {
    this.selectedUtility = utility;
    this.dialogErrorMessage = null;
    this.pageSuccessMessage = null;
    this.bookedSlots = []; // Reset slot cũ
    
    const nowStr = this.getLocalIsoString(new Date());
    // Lấy phần ngày (YYYY-MM-DD) để load slot bận ngay lập tức
    const todayStr = nowStr.split('T')[0]; 
    
    this.bookingForm.reset({
      bookingDate: nowStr,
      bookedAt: nowStr,
      residentNote: ''
    });
    
    // Load slot bận cho ngày hôm nay
    this.onDateChange(nowStr);

    this.dialog.nativeElement.showModal();
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.selectedUtility = null;
  }

  // --- LOGIC MỚI: Lấy danh sách giờ bận khi chọn ngày ---
  onDateChange(dateInput: string): void {
    if (!dateInput || !this.selectedUtility) return;

    // dateInput có dạng "2025-11-24T08:00" -> Lấy "2025-11-24"
    const dateStr = dateInput.split('T')[0];

    // Chỉ gọi API nếu ngày thay đổi
    if (dateStr !== this.selectedDate) {
      this.selectedDate = dateStr;
      this.bookingService.getBookedSlots(this.selectedUtility.utilityId, dateStr)
        .subscribe({
          next: (slots) => this.bookedSlots = slots,
          error: () => this.bookedSlots = []
        });
    }
  }

  submitBooking(): void {
    this.dialogErrorMessage = null;
    
    if (this.bookingForm.invalid || !this.selectedUtility) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const val = this.bookingForm.value;
    
    if (new Date(val.bookedAt) <= new Date(val.bookingDate)) {
      this.dialogErrorMessage = "Thời gian kết thúc phải sau thời gian bắt đầu.";
      return;
    }

    this.isLoading = true;

    // 1. LƯU TÊN TIỆN ÍCH RA BIẾN TẠM (SỬA LỖI undefined)
    const utilityName = this.selectedUtility.name;

    const dto: UtilityBookingCreateDto = {
      utilityId: this.selectedUtility.utilityId,
      bookingDate: this.toLocalISOString(val.bookingDate),
      bookedAt: this.toLocalISOString(val.bookedAt),
      residentNote: val.residentNote
    };

    this.bookingService.createBooking(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeDialog();
        // 2. DÙNG BIẾN TẠM
        this.pageSuccessMessage = `Đã gửi yêu cầu đặt ${utilityName} thành công!`;
        setTimeout(() => this.pageSuccessMessage = null, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi đặt tiện ích.';
      }
    });
  }

  private getLocalIsoString(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  }

  private toLocalISOString(dateInput: string): string {
    const date = new Date(dateInput);
    const tzOffset = date.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString();
    return localISOTime.slice(0, -1); 
  }
}