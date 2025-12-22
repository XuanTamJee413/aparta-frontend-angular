import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// Import Models
import { UtilityDto } from '../../../../models/utility.model';
import { 
  BookedSlotDto, 
  UtilityBookingCreateDto, 
  UtilityQueryParameters,
  UtilityBookingDto // Import thêm DTO cho lịch sử
} from '../../../../models/utility-booking.model';

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

  // Dialog Đặt chỗ
  @ViewChild('bookingDialog') dialog!: ElementRef<HTMLDialogElement>;
  // Dialog Hủy chỗ (Mới thêm)
  @ViewChild('cancelDialog') cancelDialog!: ElementRef<HTMLDialogElement>;

  // --- PHẦN ĐẶT TIỆN ÍCH ---
  utilities: UtilityDto[] = [];
  selectedUtility: UtilityDto | null = null;
  bookingForm: FormGroup;
  
  isLoading = false;
  pageSuccessMessage: string | null = null;
  dialogErrorMessage: string | null = null;

  bookedSlots: BookedSlotDto[] = []; 
  selectedDate: string = '';

  // --- PHẦN LỊCH SỬ (Mới thêm) ---
  myBookings: UtilityBookingDto[] = [];
  bookingIdToCancel: string | null = null;
  cancelErrorMessage: string | null = null;
  isHistoryLoading = false;

  constructor(
    private utilityService: UtilityService,
    private bookingService: UtilityBookingService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: ['', Validators.required], 
      duration: [60, [Validators.required, Validators.min(15)]],     
      residentNote: ['']
    });
  }

  ngOnInit(): void {
    this.loadAvailableUtilities();
    this.loadHistory(); // Tải luôn lịch sử khi vào trang
  }

  //  DANH SÁCH & ĐẶT TIỆN ÍCH


  loadAvailableUtilities(): void {
    const params: UtilityQueryParameters = {
      pageNumber: 1,
      pageSize: 100,
      status: 'Available'
    };

    this.utilityService.getUtilitiesForResident(params).subscribe({
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
    this.bookedSlots = [];
    
    const nowStr = this.getLocalIsoString(new Date());
    
    this.bookingForm.reset({
      bookingDate: nowStr,
      duration: 60, // Reset về 60 phút
      residentNote: ''
    });

    // [QUAN TRỌNG] Cập nhật Validator Max (Quy đổi giờ của tiện ích sang phút)
    const durationControl = this.bookingForm.get('duration');
    
    if (utility.periodTime) {
        // periodTime đang là giờ (VD: 2.0), nhân 60 để ra phút (120)
        const maxMinutes = utility.periodTime * 60;
        
        durationControl?.setValidators([
            Validators.required, 
            Validators.min(15), // Tối thiểu 15 phút
            Validators.max(maxMinutes)
        ]);
    } else {
        durationControl?.setValidators([Validators.required, Validators.min(15)]);
    }
    durationControl?.updateValueAndValidity();

    this.onDateChange(nowStr);
    this.dialog.nativeElement.showModal();
  }

  // Getter tính giờ kết thúc (Input là phút)
  get calculatedEndTime(): Date | null {
    const val = this.bookingForm.value;
    if (!val.bookingDate || !val.duration) return null;

    const startDate = new Date(val.bookingDate);
    const minutes = Number(val.duration);
    
    // Công thức: start + (số phút * 60 giây * 1000 ms)
    const endTime = new Date(startDate.getTime() + (minutes * 60 * 1000));
    return endTime;
  }

  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.selectedUtility = null;
  }

  onDateChange(dateInput: string): void {
    if (!dateInput || !this.selectedUtility) return;
    const dateStr = dateInput.split('T')[0];

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
    
    // Tính toán bookedAt (Giờ kết thúc)
    const startDate = new Date(val.bookingDate);
    const durationMinutes = Number(val.duration);
    
    // Cộng phút vào
    const endDate = new Date(startDate.getTime() + (durationMinutes * 60 * 1000));

    if (endDate <= startDate) {
       this.dialogErrorMessage = "Thời gian không hợp lệ.";
       return;
    }

    this.isLoading = true;
    const utilityName = this.selectedUtility.name;

    const dto: UtilityBookingCreateDto = {
      utilityId: this.selectedUtility.utilityId,
      bookingDate: this.toLocalISOString(val.bookingDate),
      bookedAt: this.toLocalISOString(endDate.toISOString()), // Convert endDate sang string chuẩn
      residentNote: val.residentNote
    };

    this.bookingService.createBooking(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeDialog();
        
        this.pageSuccessMessage = `Đã gửi yêu cầu đặt ${utilityName} thành công!`;
        setTimeout(() => this.pageSuccessMessage = null, 3000);

        this.loadHistory(); 
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.dialogErrorMessage = err.error?.message || 'Lỗi khi đặt tiện ích.';
      }
    });
  }


  // LỊCH SỬ & HỦY ĐẶT


  loadHistory(): void {
    this.isHistoryLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings = data;
        this.isHistoryLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải lịch sử:', err);
        this.isHistoryLoading = false;
      }
    });
  }

  openCancelModal(id: string): void {
    this.bookingIdToCancel = id;
    this.cancelErrorMessage = null; 
    this.cancelDialog.nativeElement.showModal();
  }

  closeCancelDialog(): void {
    this.cancelDialog.nativeElement.close();
    this.bookingIdToCancel = null;
  }

  confirmCancel(): void {
    if (!this.bookingIdToCancel) return;

    this.isLoading = true; 
    
    this.bookingService.cancelBooking(this.bookingIdToCancel).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeCancelDialog();
        this.loadHistory(); // Tải lại danh sách sau khi hủy
        alert('Đã hủy yêu cầu thành công.');
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.cancelErrorMessage = err.error?.message || 'Lỗi khi hủy đơn.';
      }
    });
  }

  // Helpers chung
  isExpired(dateStr: string): boolean {
    const bookingTime = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return bookingTime < now;
  }

  getStatusLabel(status: string): string {
    const map: any = {
      Pending: 'Chờ duyệt',
      Approved: 'Đã duyệt',
      Rejected: 'Bị từ chối',
      Cancelled: 'Đã hủy'
    };
    return map[status] || status;
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