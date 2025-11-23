import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContractDto, ContractManagementService } from '../../../../../services/management/contract-management.service';


@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css']
})
export class ContractDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private contractService = inject(ContractManagementService);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  contract = signal<ContractDto | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Không tìm thấy mã hợp đồng trên đường dẫn.');
      this.isLoading.set(false);
      return;
    }

    this.loadContract(id);
  }

  private loadContract(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.contractService.getContractById(id).subscribe({
      next: (c) => {
        this.contract.set(c);
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.message ||
          'Không tải được thông tin hợp đồng.';
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      }
    });
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
  }

  pdfUrl(): string | null {
    const c = this.contract();
    return c ? this.contractService.getContractPdfUrl(c.contractId) : null;
  }
}
