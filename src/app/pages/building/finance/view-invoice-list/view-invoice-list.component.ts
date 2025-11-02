import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InvoiceService } from '../../../../services/finance/invoice.service';
import { AuthService } from '../../../../services/auth.service';
import { InvoiceDto } from '../../../../models/invoice.model';

@Component({
  selector: 'app-view-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-invoice-list.component.html',
  styleUrls: ['./view-invoice-list.component.css']
})
export class ViewInvoiceListComponent implements OnInit, OnDestroy {
  Math = Math;
  invoices: InvoiceDto[] = [];
  allInvoices: InvoiceDto[] = [];
  filteredInvoices: InvoiceDto[] = [];
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();
  private apartmentCodeSubject = new Subject<string>();
  
  // Query parameters
  status: string = 'all';
  apartmentCode: string = '';
  billingPeriod: string = ''; // Format: YYYY-MM (month picker)

  // Status options
  statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chưa thanh toán' },
    { value: 'PAID', label: 'Đã thanh toán' }
  ];

  constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private router: Router
  ) {
    // Setup debounce for apartment code input
    this.apartmentCodeSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    const status = this.status || undefined;
    const apartmentCode = this.apartmentCode?.trim() || undefined;

    const statusParam = status === 'all' || !status ? undefined : status;
    
    this.invoiceService.getInvoices(statusParam, apartmentCode).subscribe({
      next: (response) => {
        if (response.succeeded && Array.isArray(response.data)) {
          this.allInvoices = response.data;
          this.applyFilters();
        } else {
          this.error = response.message || 'Không thể tải danh sách hóa đơn';
          this.allInvoices = [];
          this.filteredInvoices = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 403) {
          this.error = 'Bạn không có quyền xem danh sách hóa đơn. Vui lòng liên hệ quản trị viên.';
        } else if (error.status === 401) {
          this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          this.error = error.error?.message || error.message || 'Đã xảy ra lỗi khi tải danh sách hóa đơn';
        }
        
        this.allInvoices = [];
        this.filteredInvoices = [];
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allInvoices];

    // Filter by status
    if (this.status && this.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === this.status);
    }

    // Filter by apartment code
    if (this.apartmentCode && this.apartmentCode.trim()) {
      const searchTerm = this.apartmentCode.trim().toLowerCase();
      filtered = filtered.filter(inv => 
        inv.apartmentCode?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by billing period (month/year)
    if (this.billingPeriod && this.billingPeriod.trim()) {
      const selectedMonthYear = this.billingPeriod.trim(); // Format: YYYY-MM
      filtered = filtered.filter(inv => {
        // Check if invoice's billing period matches selected month/year
        const invoiceStart = new Date(inv.startDate);
        const invoiceEnd = new Date(inv.endDate);
        const selectedDate = new Date(selectedMonthYear + '-01');
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth() + 1;
        
        // Check if invoice period overlaps with selected month/year
        const invoiceStartYear = invoiceStart.getFullYear();
        const invoiceStartMonth = invoiceStart.getMonth() + 1;
        const invoiceEndYear = invoiceEnd.getFullYear();
        const invoiceEndMonth = invoiceEnd.getMonth() + 1;
        
        // Check if selected month/year falls within invoice period
        const selectedMonthYearStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
        const invoiceStartStr = `${invoiceStartYear}-${invoiceStartMonth.toString().padStart(2, '0')}`;
        const invoiceEndStr = `${invoiceEndYear}-${invoiceEndMonth.toString().padStart(2, '0')}`;
        
        return selectedMonthYearStr >= invoiceStartStr && selectedMonthYearStr <= invoiceEndStr;
      });
    }

    this.filteredInvoices = filtered;
    this.invoices = filtered;
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onApartmentCodeInput(): void {
    if (!this.apartmentCode || this.apartmentCode.trim() === '') {
      this.apartmentCode = '';
      this.applyFilters();
    } else {
      this.apartmentCodeSubject.next(this.apartmentCode);
    }
  }

  onBillingPeriodChange(): void {
    this.applyFilters();
  }

  onClearApartmentCode(): void {
    this.apartmentCode = '';
    this.applyFilters();
  }

  onClearBillingPeriod(): void {
    this.billingPeriod = '';
    this.applyFilters();
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
}
