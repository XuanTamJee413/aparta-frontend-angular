import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Import các module Angular Material CẦN DÙNG
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// THÊM LẠI: Import các module cho bảng Lịch sử
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import Service
import { 
  VisitorCreateDto, 
  VisitorService, 
  VisitLogStaffViewDto, // <-- THÊM
  VisitorQueryParams // <-- THÊM
} from '../../../services/resident/visitor.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule, // <-- THÊM LẠI
    MatIconModule, // <-- THÊM LẠI
    MatProgressSpinnerModule // <-- THÊM LẠI
  ],
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css']
})
export class VisitorComponent implements OnInit {

  // --- Thuộc tính Form ---
  visitorForm!: FormGroup;
  timeSlots: string[] = []; 
  
  // --- Trạng thái ---
  private residentApartmentId: string = ''; 
  
  // --- THÊM LẠI: Các thuộc tính Lịch sử ---
  isLoadingHistory = false; 
  displayedColumns: string[] = ['visitorFullName', 'purpose', 'checkinTime', 'status', 'actions'];
  history: VisitLogStaffViewDto[] = []; // Dữ liệu lịch sử
  
  // --- Constructor ---
  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    // Lấy ID căn hộ của cư dân
    const userPayload = this.auth.user();
    if (userPayload && userPayload.apartment_id) {
      this.residentApartmentId = String(userPayload.apartment_id); 
    } else {
      console.error('Không tìm thấy apartment_id của cư dân.');
      this.snackBar.open('Lỗi: Không thể xác định căn hộ của bạn.', 'Đóng', { 
        duration: 3000,
        panelClass: ['error-snackbar'] 
      });
      return; 
    }

    // Khởi tạo form
    this.populateTimeSlots(); 
    this.visitorForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: [''],
      idNumber: [''], // Bỏ required để đỡ phiền
      purpose: [''],
      checkinDate: [new Date(), Validators.required],
      checkinTime: ['12:00', Validators.required] 
    });

    // THÊM: Tải lịch sử khi component khởi tạo
    this.loadHistory();
  }

  // --- Xử lý Form ---

  /** Xử lý khi submit form đăng ký */
  onSubmit(): void {
    if (this.visitorForm.invalid) {
      this.visitorForm.markAllAsTouched();
      return;
    }
    
    // ... (logic gộp ngày giờ) ...
    const date: Date = this.visitorForm.value.checkinDate;
    const time: string = this.visitorForm.value.checkinTime;
    const [hours, minutes] = time.split(':').map(Number);
    const combinedCheckinTime = new Date(
      date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes
    );
    const pad = (num: number) => num.toString().padStart(2, '0');
    const localISOString = 
        `${combinedCheckinTime.getFullYear()}-` +
        `${pad(combinedCheckinTime.getMonth() + 1)}-` +
        `${pad(combinedCheckinTime.getDate())}T` +
        `${pad(combinedCheckinTime.getHours())}:` +
        `${pad(combinedCheckinTime.getMinutes())}:` +
        `${pad(combinedCheckinTime.getSeconds())}`;
        
    const dto: VisitorCreateDto = {
      fullName: this.visitorForm.value.fullName,
      phone: this.visitorForm.value.phone,
      idNumber: this.visitorForm.value.idNumber,
      purpose: this.visitorForm.value.purpose,
      apartmentId: this.residentApartmentId, 
      checkinTime: localISOString,
      status: 'Pending' 
    };

    // Gọi service
    this.visitorService.createVisitor(dto).subscribe({
      next: (createdVisitor) => {
        this.snackBar.open(`Đã đăng ký khách: ${createdVisitor.fullName}`, 'Đóng', {
          duration: 3000
        });
        this.resetForm();
        this.loadHistory(); // <-- THÊM: Tải lại lịch sử sau khi đăng ký thành công
      },
      error: (err) => {
        this.snackBar.open('Lỗi: Không thể đăng ký khách', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error(err);
      }
    });
  }

  /** Reset form về trạng thái ban đầu */
  resetForm(): void {
    this.visitorForm.reset({
      checkinDate: new Date(),
      checkinTime: '12:00'
    });
  }

  // --- THÊM LẠI: Xử lý Lịch sử ---

  /** Tải lịch sử khách thăm CỦA CƯ DÂN NÀY */
  loadHistory(): void {
    this.isLoadingHistory = true;

    // Chuẩn bị tham số
    const params: VisitorQueryParams = {
      apartmentId: this.residentApartmentId, // <-- Chỉ lấy của căn hộ này
      pageNumber: 1,
      pageSize: 50, // Lấy 50 lượt gần nhất
      sortColumn: 'checkinTime',
      sortDirection: 'desc'
    };

    // Gọi hàm service (dùng chung với Staff)
    this.visitorService.getAllVisitors(params).subscribe({
      next: (pagedData) => {
        this.history = pagedData.items;
        this.isLoadingHistory = false;
      },
      error: (err) => {
        this.snackBar.open('Lỗi: Không thể tải lịch sử khách thăm', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingHistory = false;
        console.error(err);
      }
    });
  }

  /** (Chức năng tương lai) Sửa lượt thăm */
  editVisit(log: VisitLogStaffViewDto): void {
    // TODO: Mở modal/form để sửa (chỉ cho phép sửa khi status = 'Pending')
    console.log('Sửa:', log);
    this.snackBar.open('Chức năng sửa đang được phát triển.', 'Đóng', { duration: 2000 });
  }

  /** (Chức năng tương lai) Xóa/Hủy lượt thăm */
  deleteVisit(log: VisitLogStaffViewDto): void {
    // TODO: Mở modal xác nhận xóa (chỉ cho phép xóa khi status = 'Pending')
    console.log('Xóa:', log);
    this.snackBar.open('Chức năng xóa đang được phát triển.', 'Đóng', { duration: 2000 });
  }
  
  // --- Helpers ---

  /** Tạo danh sách các mốc thời gian (cách nhau 30 phút) */
  populateTimeSlots(): void {
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) { 
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        this.timeSlots.push(`${hour}:${minute}`);
      }
    }
  }
}
