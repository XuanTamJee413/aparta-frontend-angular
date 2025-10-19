import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { VisitorCreatePayload, VisitorService } from '../../../services/resident/visitor.service';

// Interface cho dữ liệu hiển thị trên giao diện
interface VisitorHistory {
  name: string;
  purpose: string;
  checkinTime: string;
  status: string;
}

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // <-- Thêm ReactiveFormsModule để quản lý form
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Đăng ký khách thăm</h1>
        <p class="subtitle">Đăng ký trước khách của bạn để vào tòa nhà thuận tiện</p>
      </header>

      <section class="card">
        <h3 class="card-title">Đăng ký khách mới</h3>
        <p class="card-subtitle">Cung cấp thông tin chi tiết của khách để bộ phận an ninh xác nhận</p>
        
        <!-- Sử dụng FormGroup để quản lý form và ngSubmit để xử lý sự kiện -->
        <form class="registration-form" [formGroup]="visitorForm" (ngSubmit)="onSubmit()">
          <div class="form-group large">
            <label for="visitorName">Tên khách thăm</label>
            <input type="text" id="visitorName" placeholder="Họ và tên đầy đủ của khách" formControlName="fullName">
          </div>
          <div class="form-group small">
            <label for="visitDate">Ngày đến</label>
            <input type="date" id="visitDate" formControlName="visitDate">
          </div>
          <div class="form-group small">
            <label for="visitTime">Thời gian đến</label>
            <input type="time" id="visitTime" formControlName="visitTime">
          </div>
          <div class="form-group large">
            <label for="vehicleInfo">Thông tin phương tiện (Tùy chọn)</label>
            <input type="text" id="vehicleInfo" placeholder="Biển số xe" formControlName="vehicleInfo">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="visitorForm.invalid">Đăng ký</button>
          </div>
        </form>
      </section>

      <section class="card">
        <h3 class="card-title">Lịch sử đăng ký khách</h3>
        <p class="card-subtitle">Xem và quản lý các lượt đăng ký</p>
        <ul class="item-list">
          @for(visitor of visitorHistory; track $index) {
            <li class="visitor-item">
              <div class="visitor-avatar">{{ visitor.name.charAt(0) }}</div>
              <div class="visitor-details">
                <strong class="item-name">{{ visitor.name }}</strong>
                <div class="visitor-info">
                  <!-- Sử dụng date pipe để định dạng ngày giờ -->
                  <span class="item-date">{{ visitor.checkinTime | date:'MMM d, y, h:mm a' }}</span>
                  <span class="item-date">{{ visitor.purpose }}</span>
                </div>
              </div>
              <div class="visitor-actions">
                <span class="status" [ngClass]="visitor.status.toLowerCase()">{{ visitor.status }}</span>
                @if(visitor.status === 'Pending') {
                  <button class="btn btn-danger-outline">Hủy</button>
                }
              </div>
            </li>
          } @empty {
            <p>Chưa có lịch sử đăng ký nào.</p>
          }
        </ul>
      </section>
    </div>
  `,
  // Styles không thay đổi, giữ nguyên như cũ
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .page-container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    .subtitle, .page-header p {
      color: #6c757d;
      margin: 0.25rem 0 0 0;
    }
    .card {
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }
    .card-subtitle {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0.25rem 0 1.5rem 0;
    }
    .registration-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 1.5rem;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group.large { grid-column: span 2; }
    .form-group.small { grid-column: span 1; }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .form-group input {
      padding: 0.75rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
    }
    .form-actions {
      grid-column: 4 / 5;
    }
    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      width: 100%;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      text-align: center;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }
    .btn-danger-outline {
      background: none;
      border: 1px solid #dc3545;
      color: #dc3545;
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      width: auto;
    }
    .item-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .visitor-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f1f3f5;
    }
    .visitor-item:last-child {
      border-bottom: none;
    }
    .item-name { font-weight: 600; }
    .item-date { font-size: 0.85rem; color: #6c757d; }
    .status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
    }
    .status.upcoming, .status.pending { background-color: #cff4fc; color: #0dcaf0; }
    .status.completed { background-color: #d1e7dd; color: #198754; }
    .status.cancelled { background-color: #e2e3e5; color: #6c757d; } 
    .visitor-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e9ecef;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    .visitor-details {
      flex-grow: 1;
    }
    .visitor-info {
      display: flex;
      gap: 1rem;
      margin-top: 0.25rem;
    }
    .visitor-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `]
})
export class VisitorComponent implements OnInit {
  visitorForm!: FormGroup;
  visitorHistory: VisitorHistory[] = [];

  // Sử dụng constructor để inject service, thay thế cho hàm inject()
  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    // Khởi tạo form với các trường và validation
    this.visitorForm = this.fb.group({
      fullName: ['', Validators.required],
      visitDate: ['', Validators.required],
      visitTime: ['', Validators.required],
      vehicleInfo: ['']
    });

    // Tải danh sách lịch sử khi component được khởi tạo
    this.loadVisitorHistory();
  }

  loadVisitorHistory(): void {
    // Sử dụng forkJoin để gọi 2 API cùng lúc
    forkJoin({
      logs: this.visitorService.getVisitLogs(),
      visitors: this.visitorService.getVisitors()
    }).pipe(
      map(({ logs, visitors }) => {
        // Tạo một map để tra cứu tên visitor từ visitorId cho hiệu quả
        const visitorMap = new Map<string, string>();
        visitors.forEach(v => v.visitorId && visitorMap.set(v.visitorId, v.fullName || 'Không rõ'));

        // Lọc và chuyển đổi dữ liệu để hiển thị
        return logs
          .filter(log => log.apartmentId === '1') // Lọc các log của căn hộ '1'
          .map(log => ({
            name: log.visitorId ? visitorMap.get(log.visitorId) || 'Không rõ' : 'Không rõ',
            purpose: log.purpose || 'Không có',
            checkinTime: log.checkinTime || '',
            status: log.status || 'Không rõ'
          }));
      })
    ).subscribe({
      next: (history) => {
        this.visitorHistory = history;
        console.log('Đã tải lịch sử khách thăm:', this.visitorHistory);
      },
      error: (err) => console.error('Lỗi khi tải lịch sử khách thăm:', err)
    });
  }

  onSubmit(): void {
    if (this.visitorForm.invalid) {
      return; // Không gửi nếu form chưa hợp lệ
    }

    const formValue = this.visitorForm.value;

    // Chuẩn bị payload để gửi lên API
    const payload: VisitorCreatePayload = {
      fullName: formValue.fullName,
      apartmentId: '1', // <-- Hardcode Apartment ID là '1' như bạn yêu cầu
      purpose: `Đến thăm lúc ${formValue.visitTime} ngày ${formValue.visitDate}. Phương tiện: ${formValue.vehicleInfo || 'Không có'}`
    };

    // Gọi service để đăng ký
    this.visitorService.registerVisitor(payload).subscribe({
      next: (response) => {
        alert('Đăng ký khách thành công!');
        this.visitorForm.reset(); // Xóa trắng form
        this.loadVisitorHistory(); // Tải lại danh sách lịch sử để cập nhật
      },
      error: (err) => {
        console.error('Lỗi khi đăng ký khách:', err);
        alert('Đăng ký khách thất bại. Vui lòng thử lại.');
      }
    });
  }
}

