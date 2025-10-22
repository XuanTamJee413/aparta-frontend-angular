import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- MAIN HEADER -->
      <header class="profile-header">
        <div class="profile-summary">
          <div class="avatar">JA</div>
          <div class="info">
            <h1>{{ user.name }}</h1>
            <div class="contact-details">
              <span>{{ user.apartment }}</span>
              <span>{{ user.email }}</span>
              <span>{{ user.phone }}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-edit" routerLink="/resident/editprofile">
          Edit Profile
        </button>
        <button class="btn btn-success btn-edit" routerLink="/resident/relationship">
          Add Relationship
        </button>
      </header>

      <!-- INFORMATION CARDS -->
      <div class="info-grid">
        <!-- Personal Information -->
        <section class="card">
          <h3 class="card-title">Personal Information</h3>
          <p class="card-subtitle">Your account details</p>
          <ul class="details-list">
            <li>
              <div class="detail-icon"></div>
              <div>
                <span class="detail-label">Full Name</span>
                <span class="detail-value">{{ user.name }}</span>
              </div>
            </li>
            <li>
              <div class="detail-icon"></div>
              <div>
                <span class="detail-label">Email Address</span>
                <span class="detail-value">{{ user.email }}</span>
              </div>
            </li>
            <li>
              <div class="detail-icon"></div>
              <div>
                <span class="detail-label">Phone Number</span>
                <span class="detail-value">{{ user.phone }}</span>
              </div>
            </li>
            <li>
              <div class="detail-icon"></div>
              <div>
                <span class="detail-label">Emergency Contact</span>
                <span class="detail-value">{{ user.emergencyContact }}</span>
              </div>
            </li>
          </ul>
        </section>

        <!-- Apartment Information -->
        <section class="card">
          <h3 class="card-title">Apartment Information</h3>
          <p class="card-subtitle">Your residence details</p>
          <ul class="details-list">
             <li>
              <div class="detail-icon"></div>
              <div>
                <span class="detail-label">Apartment Number</span>
                <span class="detail-value">{{ apartment.number }}</span>
              </div>
            </li>
             <li>
              <div class="detail-icon"></div>
              <div>
                <span class="detail-label">Move-in Date</span>
                <span class="detail-value">{{ apartment.moveInDate }}</span>
              </div>
            </li>
             <li>
              <div class="detail-icon"></div>
              <div>
                <span class="detail-label">Lease Expiry</span>
                <span class="detail-value">{{ apartment.leaseExpiry }}</span>
              </div>
            </li>
          </ul>
          <div class="notification">
            Your lease is active and will expire on {{ apartment.leaseExpiry }}. Contact management for renewal options.
          </div>
        </section>
      </div>
      
      <!-- ACCOUNT ACTIONS -->
      <section class="card">
         <h3 class="card-title">Account Actions</h3>
         <p class="card-subtitle">Manage your account settings</p>
         <ul class="action-list">
            <li>
                <div class="action-icon"></div>
                <span>Edit Profile Information</span>
            </li>
             <li>
                <div class="action-icon"></div>
                <span>Change Password</span>
            </li>
             <li class="logout">
                <div class="action-icon"></div>
                <span>Logout</span>
            </li>
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
      max-width: 1200px;
      margin: 0 auto;
    }
    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      text-align: center;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
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

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .profile-summary {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: #0d6efd;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .info h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }
    .contact-details {
      display: flex;
      gap: 1.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }
    .btn-edit {
      padding: 0.5rem 1.25rem;
      font-size: 0.9rem;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .details-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .details-list li {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f1f3f5;
    }
    .details-list li:last-child {
      border-bottom: none;
    }
    .detail-icon {
      width: 20px;
      height: 20px;
    }
    .detail-label {
      font-size: 0.8rem;
      color: #6c757d;
      display: block;
    }
    .detail-value {
      font-weight: 500;
    }
    .notification {
      background-color: #e7f3ff;
      border: 1px solid #b8d6f3;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: #0d6efd;
    }
    .action-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .action-list li {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .action-list li:hover {
      background-color: #f8f9fa;
    }
    .action-list li.logout {
      color: #dc3545;
    }
    .action-icon {
      width: 20px;
      height: 20px;
    }
  `]
})
export class ProfileComponent {
  user = {
    name: 'John Anderson',
    apartment: 'Apartment A-201',
    email: 'john.anderson@email.com',
    phone: '+1 (555) 123-4567',
    emergencyContact: '+1 (555) 987-6543'
  };

  apartment = {
    number: 'A-201',
    moveInDate: 'January 15, 2023',
    leaseExpiry: 'January 14, 2026'
  };
}