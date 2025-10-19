import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

// Định nghĩa một interface cho dữ liệu visitor để code được tường minh hơn
interface Visitor {
  name: string;
  date: string;
  time: string;
  vehicle?: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Visitor Registration</h1>
        <p class="subtitle">Pre-register your guests for smooth building access</p>
      </header>

      <!-- FORM ĐĂNG KÝ KHÁCH MỚI -->
      <section class="card">
        <h3 class="card-title">Register New Visitor</h3>
        <p class="card-subtitle">Provide visitor details for security clearance</p>
        <form class="registration-form">
          <div class="form-group large">
            <label for="visitorName">Visitor Name</label>
            <input type="text" id="visitorName" placeholder="Full name of visitor">
          </div>
          <div class="form-group small">
            <label for="visitDate">Visit Date</label>
            <input type="text" id="visitDate" placeholder="dd/mm/yyyy">
          </div>
           <div class="form-group small">
            <label for="visitTime">Visit Time</label>
            <input type="text" id="visitTime" placeholder="--:-- --">
          </div>
          <div class="form-group large">
            <label for="vehicleInfo">Vehicle Info (Optional)</label>
            <input type="text" id="vehicleInfo" placeholder="License plate number">
          </div>
          <div class="form-actions">
             <button type="submit" class="btn btn-primary">Register Visitor</button>
          </div>
        </form>
      </section>

      <!-- DANH SÁCH KHÁCH ĐÃ ĐĂNG KÝ -->
      <section class="card">
        <h3 class="card-title">Your Registered Visitors</h3>
        <p class="card-subtitle">View and manage visitor registrations</p>
        <ul class="item-list">
          @for(visitor of registeredVisitors; track visitor.name) {
            <li class="visitor-item">
              <div class="visitor-avatar">{{ visitor.name.charAt(0) }}</div>
              <div class="visitor-details">
                <strong class="item-name">{{ visitor.name }}</strong>
                <div class="visitor-info">
                  <span class="item-date">{{ visitor.date }}</span>
                  <span class="item-date">{{ visitor.time }}</span>
                  @if(visitor.vehicle) {
                    <span class="item-date">{{ visitor.vehicle }}</span>
                  }
                </div>
              </div>
              <div class="visitor-actions">
                <span class="status" [ngClass]="visitor.status.toLowerCase()">{{ visitor.status }}</span>
                @if(visitor.status === 'Upcoming') {
                  <button class="btn btn-danger-outline">Cancel</button>
                }
              </div>
            </li>
          }
        </ul>
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
    .subtitle, .page-header p {
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

    .registration-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 1.5rem;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group.large { grid-column: span 2; }
    .form-group.small { grid-column: span 1; }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .form-group input {
      padding: 0.75rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
    }
    .form-actions {
      grid-column: 4 / 5;
    }

    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      width: 100%;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      text-align: center;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }
    .btn-danger-outline {
      background: none;
      border: 1px solid #dc3545;
      color: #dc3545;
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      width: auto;
    }

    .item-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .visitor-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f1f3f5;
    }
    .visitor-item:last-child {
      border-bottom: none;
    }
    .item-name { font-weight: 600; }
    .item-date { font-size: 0.85rem; color: #6c757d; }

    .status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
    }
    .status.upcoming { background-color: #cff4fc; color: #0dcaf0; }
    .status.completed { background-color: #d1e7dd; color: #198754; }
    .status.cancelled { background-color: #e2e3e5; color: #6c757d; } 


    .visitor-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e9ecef;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    .visitor-details {
      flex-grow: 1;
    }
    .visitor-info {
      display: flex;
      gap: 1rem;
      margin-top: 0.25rem;
    }
    .visitor-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `]
})
export class VisitorComponent {
  registeredVisitors: Visitor[] = [
    { name: 'Michael Chen', date: 'Oct 18, 2025', time: '2:00 PM', vehicle: 'ABC-1234', status: 'Upcoming' },
    { name: 'Sarah Williams', date: 'Oct 17, 2025', time: '10:30 AM', vehicle: 'XYZ-5678', status: 'Completed' },
    { name: 'David Martinez', date: 'Oct 16, 2025', time: '3:15 PM', status: 'Completed' },
    { name: 'Emily Johnson', date: 'Oct 20, 2025', time: '11:00 AM', vehicle: 'DEF-9012', status: 'Upcoming' },
    { name: 'James Brown', date: 'Oct 14, 2025', time: '4:00 PM', vehicle: 'GHI-3456', status: 'Cancelled' },
  ];
}

