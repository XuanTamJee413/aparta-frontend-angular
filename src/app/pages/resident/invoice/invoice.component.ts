import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Invoice {
  id: string;
  period: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending';
}

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Invoices & Payments</h1>
        <p class="subtitle">View and manage your billing history</p>
      </header>

      <!-- KHỐI THỐNG KÊ NHANH -->
      <div class="summary-grid">
        <div class="summary-card">
          <div>
            <span class="summary-title">Current Balance</span>
            <span class="summary-value">{{ 470.00 | currency:'USD' }}</span>
            <span class="summary-meta">Due Oct 25, 2025</span>
          </div>
          <div class="summary-icon icon-orange">...</div>
        </div>
        <div class="summary-card">
          <div>
            <span class="summary-title">Last Payment</span>
            <span class="summary-value">{{ 460.00 | currency:'USD' }}</span>
            <span class="summary-meta">Paid Sep 20, 2025</span>
          </div>
          <div class="summary-icon icon-green">...</div>
        </div>
        <div class="summary-card">
          <div>
            <span class="summary-title">Average Monthly</span>
            <span class="summary-value">{{ 470.00 | currency:'USD' }}</span>
            <span class="summary-meta">Last 3 months</span>
          </div>
          <div class="summary-icon icon-blue">...</div>
        </div>
      </div>

      <!-- LỊCH SỬ HÓA ĐƠN -->
      <section class="card">
        <h3 class="card-title">Billing History</h3>
        <p class="card-subtitle">All your bills and payment records</p>
        
        <table class="billing-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for(invoice of invoices; track invoice.id) {
              <tr>
                <td>{{ invoice.id }}</td>
                <td>{{ invoice.period }}</td>
                <td>{{ invoice.amount | currency:'USD' }}</td>
                <td>{{ invoice.dueDate }}</td>
                <td>
                  <span class="status" [ngClass]="invoice.status.toLowerCase()">{{ invoice.status }}</span>
                </td>
                <td class="actions-cell">
                  @if(invoice.status === 'Pending') {
                    <button class="btn btn-primary btn-small">Pay Now</button>
                  }
                  <button class="btn btn-secondary btn-small">
                    <!-- SVG Icon for PDF -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    PDF
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .page-container {
      max-width: 1100px;
      margin: 0 auto;
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
    
    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      text-align: center;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }
    .btn-secondary {
      background-color: #f8f9fa;
      color: #333;
      border: 1px solid #e9ecef;
    }
    .btn-small {
      padding: 0.3rem 0.8rem;
      font-size: 0.875rem;
    }
    
    .status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
    }
    .status.pending { background-color: #fff3cd; color: #ffc107; }
    .status.paid { background-color: #d1e7dd; color: #198754; }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .summary-card {
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .summary-card span { display: block; }
    .summary-title {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }
    .summary-value {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
    }
    .summary-meta {
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 0.25rem;
    }
    .summary-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
    }
    .icon-orange { background-color: #ffe8d6; }
    .icon-green { background-color: #d1e7dd; }
    .icon-blue { background-color: #cfe2ff; }

    .billing-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .billing-table th, .billing-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    .billing-table th {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
    }
    .billing-table td {
      font-size: 0.9rem;
      color: #333;
    }
    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class InvoiceComponent {
  invoices: Invoice[] = [
    { id: 'BILL-2025-10', period: 'October 2025', amount: 470.00, dueDate: 'Oct 25, 2025', status: 'Pending' },
    { id: 'BILL-2025-09', period: 'September 2025', amount: 460.00, dueDate: 'Sep 25, 2025', status: 'Paid' },
    { id: 'BILL-2025-08', period: 'August 2025', amount: 480.00, dueDate: 'Aug 25, 2025', status: 'Paid' },
  ];
}
