import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- MAIN CONTENT AREA -->
      <header class="page-header">
        <h1>Welcome back, {{ userName }}!</h1>
        <p class="subtitle">Here's what's happening in your building today</p>
      </header>

      <!-- NOTIFICATION -->
      <div class="notification">
        <div class="icon-bg info">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <div>
          <strong>Building Maintenance Schedule!</strong>
          <p>The swimming pool will be closed for maintenance on October 20-21, 2025. We apologize for any inconvenience.</p>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <h2 class="section-title">Quick Actions</h2>
      <div class="quick-actions">
        <div class="action-card">
          <div class="icon-bg accent1">...</div>
          <span>View Bills</span>
        </div>
        <div class="action-card">
          <div class="icon-bg accent2">...</div>
          <span>Report Issue</span>
        </div>
        <div class="action-card">
          <div class="icon-bg accent3">...</div>
          <span>Contact Staff</span>
        </div>
        <div class="action-card">
          <div class="icon-bg accent4">...</div>
          <span>Announcements</span>
        </div>
      </div>

      <!-- DATA CARDS -->
      <div class="data-grid">
        <!-- Bills Summary -->
        <section class="card">
          <h3 class="card-title">Bills Summary</h3>
          <p class="card-subtitle">Your current billing status</p>
          <ul class="item-list">
            @for(bill of bills; track bill.name) {
              <li>
                <div>
                  <span class="item-name">{{ bill.name }}</span>
                  <span class="item-date">Due: {{ bill.dueDate }}</span>
                </div>
                <div>
                  <span class="item-amount">{{ bill.amount | currency:'USD' }}</span>
                  <span class="status" [ngClass]="bill.status.toLowerCase()">{{ bill.status }}</span>
                </div>
              </li>
            }
          </ul>
          <button class="btn btn-primary">View All Bills</button>
        </section>

        <!-- Maintenance Requests -->
        <section class="card">
          <h3 class="card-title">Maintenance Requests</h3>
          <p class="card-subtitle">Track your reported issues</p>
          <ul class="item-list">
            @for(request of maintenanceRequests; track request.description) {
              <li class="maintenance-item">
                <div class="status-icon" [ngClass]="request.status.toLowerCase().replace(' ', '-')"></div>
                <div>
                  <span class="item-name">{{ request.description }}</span>
                  <span class="item-date">{{ request.date }}</span>
                </div>
                <span class="status" [ngClass]="request.status.toLowerCase().replace(' ', '-')">{{ request.status }}</span>
              </li>
            }
          </ul>
          <button class="btn btn-secondary">View All Requests</button>
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
    .item-name { font-weight: 600; }
    .item-date { font-size: 0.85rem; color: #6c757d; display: block; }
    .item-amount { font-weight: 600; margin-right: 1rem; }

    .status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
    }
    .status.pending { background-color: #fff3cd; color: #ffc107; }
    .status.paid { background-color: #d1e7dd; color: #198754; }
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
  `]
})
export class HomepageComponent implements OnInit {
  userName = 'John Anderson';

  bills = [
    { name: 'Electricity', dueDate: 'Oct 20, 2025', amount: 85.00, status: 'Pending' },
    { name: 'Water', dueDate: 'Oct 20, 2025', amount: 35.00, status: 'Pending' },
    { name: 'Management Fee', dueDate: 'Oct 15, 2025', amount: 250.00, status: 'Paid' }
  ];

  maintenanceRequests = [
    { description: 'AC not cooling properly', date: 'Oct 18, 2025', status: 'In Progress' },
    { description: 'Leaking faucet in bathroom', date: 'Oct 12, 2025', status: 'Resolved' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Đảm bảo component được khởi tạo đúng cách
    try {
      // Có thể thêm logic load data từ API ở đây nếu cần
      console.log('HomepageComponent initialized');
    } catch (error) {
      console.error('Error initializing HomepageComponent:', error);
    }
  }
}

