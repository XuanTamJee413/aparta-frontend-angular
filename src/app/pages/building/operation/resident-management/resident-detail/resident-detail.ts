import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse, ApartmentMember } from '../../resident-list/resident-list';
import { ResidentManagementService } from '../../../../../services/management/resident-management.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-resident-detail',
  imports: [CommonModule, DatePipe],
  standalone: true,
  template: `
    <div class="page-container">

      @if (isLoading) {
        <div class="card" style="text-align: center; padding: 2rem;">
          <p>Đang tải thông tin cư dân...</p>
        </div>
      } @else if (error) {
        <div class="card alert alert-danger" style="padding: 1.5rem;">
          <strong>Lỗi!</strong> {{ error }}
        </div>
      } @else if (member) {
        <header class="profile-header">
          <div class="profile-summary">

            @if (member.faceImageUrl) {
              <img [src]="member.faceImageUrl" alt="Avatar" class="avatar-img">
            } @else {
              <div class="avatar">{{ getInitials(member.name) }}</div>
            }

            <div class="info">
              <h1>{{ member.name }}</h1>
              <div class="contact-details">
                <span>Căn hộ: {{ member.apartmentId }}</span>
                <span>SĐT: {{ member.phoneNumber || 'N/A' }}</span>
                <span>
                  <span class="status-badge" [ngClass]="member.status === 'Active' ? 'status-active' : 'status-inactive'">
                    {{ member.status }}
                  </span>
                </span>
              </div>
            </div>
          </div>

        </header>

        <div class="info-grid">
          <section class="card">
            <h3 class="card-title">Thông tin cá nhân</h3>
            <p class="card-subtitle">Chi tiết định danh và liên lạc</p>
            <ul class="details-list">
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Họ và tên</span>
                  <span class="detail-value">{{ member.name }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Số điện thoại</span>
                  <span class="detail-value">{{ member.phoneNumber || 'Chưa cập nhật' }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">CCCD/CMND</span>
                  <span class="detail-value">{{ member.idNumber || 'Chưa cập nhật' }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Ngày sinh</span>
                  <span class="detail-value">{{ member.dateOfBirth | date: 'dd/MM/yyyy' : 'N/A' }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Giới tính</span>
                  <span class="detail-value">{{ member.gender || 'Chưa cập nhật' }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Quốc tịch</span>
                  <span class="detail-value">{{ member.nationality || 'Chưa cập nhật' }}</span>
                </div>
              </li>
            </ul>
          </section>

          <section class="card">
            <h3 class="card-title">Thông tin Cư trú</h3>
            <p class="card-subtitle">Chi tiết vai trò và căn hộ</p>
            <ul class="details-list">
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Mã căn hộ</span>
                  <span class="detail-value">{{ member.apartmentId }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Vai trò</span>
                  <span class="detail-value">
                    @if (member.isOwner) {
                      <span class="status-owner-detail">Chủ Hộ</span>
                    } @else {
                      <span class="status-member-detail">Thành viên ({{ member.familyRole || 'N/A' }})</span>
                    }
                  </span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Trạng thái</span>
                  <span class="detail-value">{{ member.status }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Ngày tạo hồ sơ</span>
                  <span class="detail-value">{{ member.createdAt | date: 'dd/MM/yyyy HH:mm' : 'N/A' }}</span>
                </div>
              </li>
              <li>
                <div class="detail-icon"></div>
                <div>
                  <span class="detail-label">Cập nhật lần cuối</span>
                  <span class="detail-value">{{ member.updatedAt | date: 'dd/MM/yyyy HH:mm' : 'N/A' }}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>

        @if (member.info) {
          <section class="card">
            <h3 class="card-title">Thông tin thêm</h3>
            <p class="card-subtitle">Ghi chú bổ sung về cư dân</p>
            <div class="info-text">
              {{ member.info }}
            </div>
          </section>
        }
      } @else {
        <div class="card" style="text-align: center; padding: 2rem;">
          <p>Không tìm thấy thông tin cư dân.</p>
        </div>
      }
    </div>
  `,

  styles: [
    `
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      text-align: center;
      text-decoration: none;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }
    .btn-primary:hover {
      background-color: #0b5ed7;
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

    .profile-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }
    .profile-summary {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: #0d6efd;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .avatar-img {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      border: 2px solid #e9ecef;
    }
    .info h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }
    .contact-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      color: #6c757d;
      font-size: 0.9rem;
      align-items: center;
    }
    .btn-edit {
      padding: 0.5rem 1.25rem;
      font-size: 0.9rem;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .details-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .details-list li {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f1f3f5;
    }
    .details-list li:last-child {
      border-bottom: none;
    }
    .detail-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .detail-label {
      font-size: 0.8rem;
      color: #6c757d;
      display: block;
    }
    .detail-value {
      font-weight: 500;
      color: #212529;
    }
    .info-text {
      color: #212529;
      line-height: 1.6;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      text-transform: capitalize;
    }
    .status-active {
      color: #065f46;
      background-color: #d1fae5;
    }
    .status-inactive {
      color: #991b1b;
      background-color: #fee2e2;
    }
    .status-owner-detail {
      font-weight: 600;
      color: #065f46;
    }
    .status-member-detail {
      font-weight: 500;
      color: #1d4ed8;
    }
    .alert.alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    `
  ]
})
export class ResidentDetail implements OnInit {

  member: ApartmentMember | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private residentService: ResidentManagementService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Không tìm thấy ID của cư dân.';
      this.isLoading = false;
      return;
    }

    this.loadMember(id);
  }


  loadMember(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.residentService.getMemberById(id).subscribe({

      next: (memberData: ApartmentMember) => {
        this.member = memberData;
        this.isLoading = false;
      },

      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {

          this.error = 'Không tìm thấy thông tin cư dân.';
        } else {

          this.error = 'Không thể tải được dữ liệu. Vui lòng thử lại sau.';
        }
        console.error('Lỗi khi gọi API chi tiết:', err);
        this.isLoading = false;
      }
    });
  }


  getInitials(name: string | null | undefined): string {
    if (!name) return '...';

    const names = name.split(' ');
    if (names.length === 0) return '...';

    const firstInitial = names[0][0] || '';
    const lastInitial = names.length > 1 ? names[names.length - 1][0] : '';

    return (firstInitial + lastInitial).toUpperCase();
  }
}
