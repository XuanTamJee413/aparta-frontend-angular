import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../services/finance/invoice.service';
import { AuthService } from '../../../services/auth.service';
import { InvoiceDto } from '../../../models/invoice.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  invoices: InvoiceDto[] = [];
  loading = false;
  error = '';
  processingPayment = false;

  constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = '';

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.loading = false;
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.invoiceService.getMyInvoices().subscribe({
      next: (response) => {
        if (response.succeeded && Array.isArray(response.data)) {
          this.invoices = response.data;
        } else {
          this.error = response.message || 'Không thể tải danh sách hóa đơn';
          this.invoices = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 403) {
          this.error = 'Bạn không có quyền xem hóa đơn. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 401) {
          this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          this.error = error.error?.message || error.message || 'Đã xảy ra lỗi khi tải danh sách hóa đơn';
        }
        
        this.invoices = [];
      }
    });
  }

  payInvoice(invoice: InvoiceDto): void {
    if (this.processingPayment) return;

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.processingPayment = true;
    this.error = '';

    this.invoiceService.createPayment(invoice.invoiceId).subscribe({
      next: (response) => {
        this.processingPayment = false;
        if (response.succeeded && response.data) {
          // Redirect to payment URL
          window.location.href = response.data;
        } else {
          this.error = response.message || 'Không thể tạo link thanh toán';
        }
      },
      error: (error) => {
        this.processingPayment = false;
        
        if (error.status === 403) {
          this.error = 'Bạn không có quyền thanh toán hóa đơn. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 401) {
          this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          this.error = error.error?.message || error.message || 'Lỗi khi tạo link thanh toán';
        }
      }
    });
  }

  downloadPDF(invoice: InvoiceDto): void {
    // TODO: Implement PDF download
    console.log('Download PDF for invoice:', invoice.invoiceId);
  }

  viewDetail(invoiceId: string): void {
    this.router.navigate(['/my-invoice-detail', invoiceId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '-';
    }
  }

  getBillingPeriod(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return '-';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
      const startYear = start.getFullYear();
      const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
      const endYear = end.getFullYear();
      return `${startMonth}/${startYear} - ${endMonth}/${endYear}`;
    } catch {
      return '-';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chưa thanh toán',
      'PAID': 'Đã thanh toán',
      'OVERDUE': 'Quá hạn',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getTotalPending(): number {
    return this.invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + (inv.price || 0), 0);
  }

  getNextDueDate(): string | null {
    const pending = this.invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    return pending.length > 0 ? pending[0].endDate : null;
  }

  getLastPaidAmount(): number {
    const paid = this.invoices
      .filter(inv => inv.status === 'PAID')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return paid.length > 0 ? paid[0].price : 0;
  }

  getLastPaidDate(): string | null {
    const paid = this.invoices
      .filter(inv => inv.status === 'PAID')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return paid.length > 0 ? paid[0].updatedAt : null;
  }

  getAverageMonthly(): number {
    const recentPaid = this.invoices
      .filter(inv => inv.status === 'PAID')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 3);
    
    if (recentPaid.length === 0) return 0;
    
    const total = recentPaid.reduce((sum, inv) => sum + (inv.price || 0), 0);
    return total / recentPaid.length;
  }
}
