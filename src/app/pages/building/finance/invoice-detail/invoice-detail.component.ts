import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceManagementService } from '../../../../services/finance/invoice-management.service';
import { InvoiceDetailDto, InvoiceItemDto } from '../../../../models/invoice-management.model';
import { ParsedDescription } from '../invoice-management/invoice-management.component';

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
      
      // Check if print parameter is present
      const printParam = this.route.snapshot.queryParamMap.get('print');
      if (printParam === 'true') {
        // Wait for invoice to load, then print
        setTimeout(() => {
          window.print();
        }, 1000);
      }
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
}

