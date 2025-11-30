import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildingDto } from '../../../../../services/admin/building.service';

@Component({
  selector: 'app-receipt-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-preview.component.html',
  styleUrls: ['./receipt-preview.component.css']
})
export class ReceiptPreviewComponent {
  @Input() selectedBuilding: BuildingDto | null = null;
  @Input() payerName: string = '';
  @Input() apartmentAddress: string = '';
  @Input() itemDescription: string = '';
  @Input() amount: number = 0;
  @Input() note: string = '';
  @Input() imagePreviews: string[] = [];
  @Input() endDate: string | null = null;

  getCurrentDate(): string {
    return new Date().toLocaleDateString('vi-VN');
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatNumber(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  viewEvidence(url: string): void {
    window.open(url, '_blank');
  }
}

