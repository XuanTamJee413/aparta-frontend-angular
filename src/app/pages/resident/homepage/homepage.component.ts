import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvoiceService } from '../../../services/finance/invoice.service';
import { ProposalService, ProposalDto } from '../../../services/resident/proposal.service';
import { ProfileService } from '../../../services/profile.service';
import { InvoiceDto } from '../../../models/invoice.model';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <!-- MAIN CONTENT AREA -->
      <header class="page-header">
        <h1>Chào mừng trở lại </h1>
        <h2>Căn hộ: {{ apartmentCode }}</h2>
      </header>

    
      <!-- QUICK ACTIONS -->
      <h2 class="section-title">Thao tác nhanh</h2>
      <div class="quick-actions">
        <a routerLink="/invoice" class="action-card">
          <div class="icon-bg accent1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <span>Xem hóa đơn</span>
        </a>
        <a routerLink="/send-proposal" class="action-card">
          <div class="icon-bg accent2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </div>
          <span>Gửi đề xuất</span>
        </a>
        <a routerLink="/chat" class="action-card">
          <div class="icon-bg accent3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <span>Liên hệ nhân viên</span>
        </a>
        <a routerLink="/news" class="action-card">
          <div class="icon-bg accent4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <span>Thông báo</span>
        </a>
      </div>

      <!-- DATA CARDS -->
      <div class="data-grid">
        <!-- Bills Summary -->
        <section class="card">
          <h3 class="card-title">Tóm tắt hóa đơn</h3>
          <p class="card-subtitle">Tình trạng thanh toán hiện tại của bạn</p>
          @if(loadingBills) {
            <div class="loading">Đang tải...</div>
          } @else if(bills.length === 0) {
            <div class="empty-state">Không có hóa đơn nào</div>
          } @else {
            <ul class="item-list">
              @for(bill of bills; track bill.invoiceId) {
                <li>
                  <div>
                    <span class="item-name">{{ getBillName(bill.feeType) }}</span>
                    <span class="item-date">Đến hạn: {{ formatDate(bill.endDate) }}</span>
                  </div>
                  <div>
                    <span class="item-amount">{{ bill.price | currency:'VND':'symbol':'1.0-0' }}</span>
                    <span class="status" [ngClass]="bill.status.toLowerCase()">{{ getStatusLabel(bill.status) }}</span>
                  </div>
                </li>
              }
            </ul>
          }
          <a routerLink="/invoice" class="btn btn-primary">Xem tất cả hóa đơn</a>
        </section>

        <!-- Proposal -->
        <section class="card">
          <h3 class="card-title">Đề xuất</h3>
          <p class="card-subtitle">Theo dõi các đề xuất của bạn</p>
          @if(loadingProposals) {
            <div class="loading">Đang tải...</div>
          } @else if(proposals.length === 0) {
            <div class="empty-state">Chưa có đề xuất nào</div>
          } @else {
            <ul class="item-list">
              @for(proposal of proposals; track proposal.proposalId) {
                <li class="maintenance-item">
                  <div class="status-icon" [ngClass]="getProposalStatusClass(proposal.status)"></div>
                  <div>
                    <span class="item-name">{{ getProposalPreview(proposal.content) }}</span>
                    <span class="item-date">{{ formatDate(proposal.createdAt) }}</span>
                  </div>
                  <span class="status" [ngClass]="getProposalStatusClass(proposal.status)">{{ getProposalStatusLabel(proposal.status) }}</span>
                </li>
              }
            </ul>
          }
          <a routerLink="/send-proposal" class="btn btn-primary">Xem tất cả đề xuất</a>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100%;
      background-color: transparent;
    }

    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100%;
      background-color: transparent;
    }
    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    .subtitle {
      color: #6c757d;
      margin: 0.25rem 0 0 0;
    }

    .card {
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
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

    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      width: 100%;
      margin-top: 1.5rem;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }
    .btn-secondary {
      background-color: #fff;
      color: #333;
      border: 1px solid #e9ecef;
    }

    .item-list { 
      list-style: none; 
      padding: 0; 
      margin: 0; 
    }
    .item-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #f1f3f5;
    }
    .item-list li:last-child { border-bottom: none; }
    .item-name { font-weight: 500; }
    .item-date { font-size: 0.85rem; color: #6c757d; display: block; }
    .item-amount { font-weight: 600; margin-right: 1rem; }

    .status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
    }
    .status.pending { background-color: #fff3cd; color: #856404; }
    .status.paid { background-color: #d1e7dd; color: #198754; }
    .status.overdue { background-color: #f8d7da; color: #721c24; }
    .status.cancelled { background-color: #e2e3e5; color: #383d41; }
    .status.resolved { background-color: #d1e7dd; color: #198754; }
    .status.in-progress { background-color: #cff4fc; color: #0dcaf0; }

    .notification {
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: #e7f3ff;
      border: 1px solid #b8d6f3;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 2rem;
      color: #0d6efd;
    }
    .notification p { margin: 0.25rem 0 0; font-size: 0.9rem; }
    .notification strong { font-weight: 600; }

    .icon-bg {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }
    .icon-bg.info { background-color: #0d6efd; }
    
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2.5rem 0 1rem 0;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .action-card {
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .action-card .icon-bg { margin: 0 auto 1rem; }
    .action-card span { font-weight: 500; }
    .accent1 { background-color: #6f42c1; }
    .accent2 { background-color: #d63384; }
    .accent3 { background-color: #198754; }
    .accent4 { background-color: #fd7e14; }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-top: 2.5rem;
    }
    
    .maintenance-item { gap: 1rem; }
    .maintenance-item .status { margin-left: auto; }
    .status-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      position: relative;
    }
    .status-icon.in-progress { background-color: #cff4fc; }
    .status-icon.resolved { background-color: #d1e7dd; }
    .status-icon.pending { background-color: #fff3cd; }

    .loading, .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .btn {
      text-decoration: none;
      display: block;
      text-align: center;
    }
  `]
})
export class HomepageComponent implements OnInit {
  userName = 'Người dùng';
  apartmentCode: string | null = null;
  bills: InvoiceDto[] = [];
  proposals: ProposalDto[] = [];
  loadingBills = false;
  loadingProposals = false;

  constructor(
    private invoiceService: InvoiceService,
    private proposalService: ProposalService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadBills();
    this.loadProposals();
  }

  loadUserProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.userName = response.data.fullName || 'Người dùng';
          // Lấy apartment code từ apartmentInfo nếu có
          if (response.data.apartmentInfo) {
            this.apartmentCode = response.data.apartmentInfo;
          }
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadBills(): void {
    this.loadingBills = true;
    this.invoiceService.getMyInvoices().subscribe({
      next: (response) => {
        if (response.succeeded && Array.isArray(response.data)) {
          // Lấy 3 hóa đơn gần nhất, sắp xếp theo ngày tạo mới nhất
          this.bills = response.data
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          
          // Lấy apartment code từ invoice đầu tiên nếu chưa có
          if (!this.apartmentCode && this.bills.length > 0 && this.bills[0].apartmentCode) {
            this.apartmentCode = this.bills[0].apartmentCode;
          }
        } else {
          this.bills = [];
        }
        this.loadingBills = false;
      },
      error: (error) => {
        console.error('Error loading bills:', error);
        this.bills = [];
        this.loadingBills = false;
      }
    });
  }

  loadProposals(): void {
    this.loadingProposals = true;
    this.proposalService.getResidentHistory().subscribe({
      next: (proposals) => {
        // Lấy 3 đề xuất gần nhất, sắp xếp theo ngày tạo mới nhất
        this.proposals = proposals
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3);
        this.loadingProposals = false;
      },
      error: (error) => {
        console.error('Error loading proposals:', error);
        this.proposals = [];
        this.loadingProposals = false;
      }
    });
  }

  formatDate(date: string | Date | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  getBillName(feeType: string): string {
    const feeTypeMap: { [key: string]: string } = {
      'UTILITY': 'Tiện ích',
      'ELECTRICITY': 'Điện',
      'WATER': 'Nước',
      'MANAGEMENT_FEE': 'Phí quản lý',
      'PARKING_FEE': 'Phí gửi xe',
      'SERVICE_FEE': 'Phí dịch vụ',
      'OTHER': 'Khác'
    };
    return feeTypeMap[feeType] || feeType;
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ thanh toán',
      'PAID': 'Đã thanh toán',
      'OVERDUE': 'Quá hạn',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getProposalStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'resolved' || statusLower === 'đã xử lý') {
      return 'resolved';
    }
    if (statusLower === 'pending' || statusLower === 'chờ xử lý') {
      return 'pending';
    }
    return 'in-progress';
  }

  getProposalStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xử lý',
      'IN_PROGRESS': 'Đang xử lý',
      'COMPLETED': 'Đã xử lý',
      'RESOLVED': 'Đã xử lý',
      'REJECTED': 'Đã từ chối'
    };
    return statusMap[status.toUpperCase()] || status;
  }

  getProposalPreview(content: string): string {
    if (!content) return 'Không có nội dung';
    if (content.length > 50) {
      return content.substring(0, 50) + '...';
    }
    return content;
  }
}

