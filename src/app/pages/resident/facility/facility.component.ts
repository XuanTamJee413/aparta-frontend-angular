import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Facility {
  name: string;
  description: string;
  maxBooking: string;
  status: 'Available' | 'Unavailable';
  reason?: string;
}

interface Booking {
  name: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending';
}

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Facilities Booking</h1>
        <p class="subtitle">Reserve building amenities for your convenience</p>
      </header>

      <!-- AVAILABLE FACILITIES -->
      <section>
        <h3 class="section-title">Available Facilities</h3>
        <div class="facilities-grid">
          @for(facility of availableFacilities; track facility.name) {
            <div class="card facility-card">
              <div class="facility-header">
                <div class="facility-info">
                  <div class="icon-bg accent-blue"></div>
                  <div>
                    <strong class="item-name">{{ facility.name }}</strong>
                    <span class="item-description">{{ facility.description }}</span>
                  </div>
                </div>
                <span class="status" [ngClass]="facility.status.toLowerCase()">{{ facility.status }}</span>
              </div>
              <div class="facility-footer">
                <div>
                  <span class="item-date">Max booking: {{ facility.maxBooking }}</span>
                  @if(facility.status === 'Unavailable' && facility.reason) {
                    <span class="unavailable-reason">{{ facility.reason }}</span>
                  }
                </div>
                <button class="btn btn-primary" [disabled]="facility.status === 'Unavailable'">Book Now</button>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- UPCOMING BOOKINGS -->
      <section class="card">
        <h3 class="card-title">Your Upcoming Bookings</h3>
        <p class="card-subtitle">Manage your facility reservations</p>
        <ul class="item-list">
          @for(booking of upcomingBookings; track booking.name) {
            <li class="booking-item">
              <div class="icon-bg accent-blue"></div>
              <div class="booking-details">
                <strong class="item-name">{{ booking.name }}</strong>
                <span class="item-date">{{ booking.date }} @ {{ booking.time }}</span>
              </div>
              <div class="booking-actions">
                <span class="status" [ngClass]="booking.status.toLowerCase()">{{ booking.status }}</span>
                <button class="btn btn-danger-outline">Cancel</button>
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
      max-width: 1200px;
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
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }
    .btn-primary:disabled {
      background-color: #a1c9ff;
      cursor: not-allowed;
    }
    .btn-danger-outline {
      background: none;
      border: 1px solid #dc3545;
      color: #dc3545;
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
    }
    .status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      white-space: nowrap;
    }
    .status.available, .status.confirmed { background-color: #d1e7dd; color: #198754; }
    .status.unavailable { background-color: #f8d7da; color: #dc3545; }
    .status.pending { background-color: #fff3cd; color: #ffc107; }
    .item-list { 
      list-style: none; 
      padding: 0; 
      margin: 0; 
    }
    .item-name { font-weight: 600; }
    .item-date { font-size: 0.85rem; color: #6c757d; }
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2.5rem 0 1rem 0;
    }
    .icon-bg {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }
    .accent-blue { background-color: #cfe2ff; }
    
    .facilities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 1.5rem;
    }
    .facility-card {
      margin-top: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .facility-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .facility-info {
      display: flex;
      gap: 1rem;
    }
    .item-description {
      font-size: 0.9rem;
      color: #6c757d;
      display: block;
    }
    .facility-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 1rem;
    }
    .unavailable-reason {
      color: #dc3545;
      font-size: 0.8rem;
      display: block;
      margin-top: 0.25rem;
    }
    .booking-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f1f3f5;
    }
    .booking-item:last-child {
      border-bottom: none;
    }
    .booking-details {
      flex-grow: 1;
    }
    .booking-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `]
})
export class FacilityComponent {
  availableFacilities: Facility[] = [
    { name: 'Fitness Gym', description: 'Fully equipped gym with cardio and strength training equipment', maxBooking: '2 hours', status: 'Available' },
    { name: 'Swimming Pool', description: 'Olympic-size swimming pool with dedicated lap lanes', maxBooking: '1 hour', status: 'Unavailable', reason: 'Closed for maintenance Oct 20-21' },
    { name: 'BBQ Area', description: 'Outdoor BBQ area with grills and seating for gatherings', maxBooking: '4 hours', status: 'Available' },
    { name: 'Meeting Room', description: 'Conference room with projector and whiteboard', maxBooking: '3 hours', status: 'Available' }
  ];

  upcomingBookings: Booking[] = [
    { name: 'Fitness Gym', date: 'Oct 18, 2025', time: '4:00 PM - 6:00 PM', status: 'Confirmed' },
    { name: 'BBQ Area', date: 'Oct 22, 2025', time: '12:00 PM - 4:00 PM', status: 'Confirmed' },
    { name: 'Meeting Room', date: 'Oct 19, 2025', time: '2:00 PM - 4:00 PM', status: 'Pending' }
  ];
}
