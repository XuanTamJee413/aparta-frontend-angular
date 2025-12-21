import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../../services/finance/invoice.service';
import { InvoiceDetailDto, InvoiceItemDto } from '../../../../models/invoice-management.model';

// Interface for parsed description
export interface ParsedDescription {
  itemDescription: string;
  note?: string;
  evidenceUrls: string[];
  rawText: string;
}

@Component({
  selector: 'app-my-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-invoice-detail.component.html',
  styleUrls: ['./my-invoice-detail.component.css']
})
export class MyInvoiceDetailComponent implements OnInit {
  invoiceId: string = '';
  invoiceDetail: InvoiceDetailDto | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceId = id;
      this.loadInvoiceDetail();
    } else {
      this.error = 'Không tìm thấy ID hóa đơn';
    }
  }

  // Tải chi tiết hóa đơn
  loadInvoiceDetail(): void {
    this.isLoading = true;
    this.error = null;

    this.invoiceService.getMyInvoiceDetail(this.invoiceId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.invoiceDetail = response.data;
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
    this.router.navigate(['/invoice']);
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

  // Parse description from JSON (for one-time invoices)
  parseDescription(description: string): ParsedDescription {
    if (!description) {
      return {
        itemDescription: '',
        note: undefined,
        evidenceUrls: [],
        rawText: ''
      };
    }

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(description);
      
      return {
        itemDescription: parsed.itemDescription || '',
        note: parsed.note || undefined,
        evidenceUrls: Array.isArray(parsed.evidenceUrls) ? parsed.evidenceUrls : [],
        rawText: parsed.itemDescription + (parsed.note ? `. ${parsed.note}` : '')
      };
    } catch (e) {
      // Fallback: If not JSON, try to parse old format (for backward compatibility)
      const evidenceMatch = description.match(/\[Evidence: ([^\]]+)\]/);
      let evidenceUrls: string[] = [];
      let textWithoutEvidence = description;

      if (evidenceMatch) {
        const evidenceText = evidenceMatch[1];
        evidenceUrls = evidenceText.split(';').map((url: string) => url.trim()).filter((url: string) => url);
        textWithoutEvidence = description.replace(/\[Evidence: [^\]]+\]/, '').trim();
      }

      // Split itemDescription and note (format: "ItemDescription. Note")
      const parts = textWithoutEvidence.split('.').map((p: string) => p.trim()).filter((p: string) => p);
      
      let itemDescription = parts[0] || '';
      let note: string | undefined = undefined;

      if (parts.length > 1) {
        // Join remaining parts as note (in case note contains multiple sentences)
        note = parts.slice(1).join('. ').trim();
      }

      return {
        itemDescription,
        note: note || undefined,
        evidenceUrls,
        rawText: textWithoutEvidence
      };
    }
  }

  viewEvidence(url: string): void {
    window.open(url, '_blank');
  }

  //Kiểm tra xem invoice có quá hạn không
  isInvoiceOverdue(endDate: string): boolean {
    if (!endDate) return false;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(endDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    } catch {
      return false;
    }
  }
}

