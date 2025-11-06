import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceManagementService } from '../../../../services/finance/invoice-management.service';
import { InvoiceDetailDto, InvoiceItemDto } from '../../../../models/invoice-management.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceId: string = '';
  invoice: InvoiceDetailDto | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceManagementService
  ) {}

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId') || '';
    if (this.invoiceId) {
      this.loadInvoiceDetail();
    } else {
      this.error = 'Không tìm thấy ID hóa đơn';
    }
  }

  // Tải chi tiết hóa đơn
  loadInvoiceDetail(): void {
    this.isLoading = true;
    this.error = null;

    this.invoiceService.getInvoiceDetail(this.invoiceId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.invoice = response.data;
        } else {
          this.error = response.message || 'Không thể tải chi tiết hóa đơn';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Không thể tải chi tiết hóa đơn';
        this.isLoading = false;
      }
    });
  }

  // Quay lại danh sách
  goBack(): void {
    this.router.navigate(['/manager/invoice-management']);
  }

  // Format date
  formatDate(date: string): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return date;
    }
  }

  // Format currency
  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Tính thành tiền cho item (nếu amount không có thì tính từ quantity * unitPrice)
  getItemAmount(item: InvoiceItemDto): number {
    if (item.amount !== null && item.amount !== undefined && !isNaN(item.amount)) {
      return item.amount;
    }
    // Tính từ quantity * unitPrice
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    return quantity * unitPrice;
  }

  // Get status class
  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'status-paid';
      case 'PENDING':
        return 'status-pending';
      case 'OVERDUE':
        return 'status-overdue';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // Get status label
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }
}

