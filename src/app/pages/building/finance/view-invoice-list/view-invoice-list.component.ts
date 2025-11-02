import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../../services/finance/invoice.service';
import {
  InvoiceDto,
  PagedList,
  InvoiceQueryParameters
} from '../../../../models/invoice.model';

@Component({
  selector: 'app-view-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-invoice-list.component.html',
  styleUrls: ['./view-invoice-list.component.css']
})
export class ViewInvoiceListComponent implements OnInit {
  Math = Math;
  invoices: InvoiceDto[] = [];
  loading = false;
  error = '';
  
  // Query parameters
  status: string = '';
  searchTerm: string = '';
  month: string = '';
  sortBy: string = 'issueDate';
  sortOrder: string = 'desc';
  pageNumber = 1;
  pageSize = 50;
  
  // Pagination info
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Status options
  statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chưa thanh toán' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'OVERDUE', label: 'Quá hạn' },
    { value: 'CANCELLED', label: 'Đã hủy' }
  ];

  // Sort options
  sortOptions = [
    { value: 'issueDate', label: 'Ngày phát hành' },
    { value: 'dueDate', label: 'Ngày đến hạn' },
    { value: 'totalAmount', label: 'Tổng tiền' },
    { value: 'apartmentCode', label: 'Mã căn hộ' },
    { value: 'residentName', label: 'Tên cư dân' }
  ];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = '';

    const params: InvoiceQueryParameters = {
      status: this.status || undefined,
      searchTerm: this.searchTerm || undefined,
      month: this.month || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.invoiceService.getInvoices(params).subscribe({
      next: (response) => {
        console.log('Invoice API Response:', response);
        if (response && response.succeeded) {
          if (response.data && response.data.items) {
            this.invoices = response.data.items;
            this.totalCount = response.data.totalCount || 0;
            this.totalPages = response.data.totalPages || 0;
            this.hasPreviousPage = response.data.hasPreviousPage || false;
            this.hasNextPage = response.data.hasNextPage || false;
          } else {
            this.invoices = [];
            this.totalCount = 0;
            this.totalPages = 0;
            this.hasPreviousPage = false;
            this.hasNextPage = false;
            this.error = 'Không có dữ liệu hóa đơn';
          }
        } else {
          this.error = response?.message || 'Không lấy được danh sách hóa đơn';
          this.invoices = [];
          this.totalCount = 0;
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        
        if (error.error) {
          this.error = error.error.message || error.error.Message || `Lỗi ${error.status}: ${error.statusText}`;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra kết nối API.';
        }
        
        this.loading = false;
        this.invoices = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.hasPreviousPage = false;
        this.hasNextPage = false;
      }
    });
  }

  onFilterChange(): void {
    this.pageNumber = 1;
    this.loadInvoices();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadInvoices();
    }
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'PAID':
        return 'status-paid';
      case 'OVERDUE':
        return 'status-overdue';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }


  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '-';
    }
  }

  formatCurrency(amount: number): string {
    if (amount == null || isNaN(amount)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getBillingPeriod(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return '-';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return '-';
      }
      const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
      const startYear = start.getFullYear();
      const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
      const endYear = end.getFullYear();
      return `${startMonth}/${startYear} - ${endMonth}/${endYear}`;
    } catch {
      return '-';
    }
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }
}

