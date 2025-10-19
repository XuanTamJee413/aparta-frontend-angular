import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Announcement {
  title: string;
  description: string;
  date: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Announcements</h1>
        <p class="subtitle">Stay updated with building news and events</p>
      </header>

      <div class="announcements-list">
        @for(announcement of announcements; track announcement.title) {
          <section class="card announcement-card">
            <div class="icon-bg accent-grey">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div class="announcement-content">
              <div class="announcement-header">
                <strong class="item-name">{{ announcement.title }}</strong>
                <span class="status" [ngClass]="announcement.priority.toLowerCase()">{{ announcement.priority }}</span>
              </div>
              <p class="item-description">{{ announcement.description }}</p>
              <div class="announcement-footer">
                <div class="meta-tags">
                  <span class="item-date">{{ announcement.date }}</span>
                  <span class="item-category">{{ announcement.category }}</span>
                </div>
                <button class="btn btn-secondary btn-small">View Details</button>
              </div>
            </div>
          </section>
        }
      </div>
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
      margin-top: 1.5rem;
    }
    .btn {
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
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
      white-space: nowrap;
    }
    .status.high { background-color: #f8d7da; color: #dc3545; }
    .status.medium { background-color: #cff4fc; color: #0dcaf0; }
    .status.low { background-color: #e2e3e5; color: #6c757d; }
    .item-name { font-weight: 600; }
    .item-date { font-size: 0.85rem; color: #6c757d; }
    .icon-bg {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .accent-grey { background-color: #f1f3f5; color: #6c757d; }

    .announcements-list {
      margin-top: 2rem;
    }
    .announcement-card {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .announcement-content {
      flex-grow: 1;
    }
    .announcement-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .item-description {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
    }
    .announcement-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
    }
    .meta-tags {
      display: flex;
      gap: 1rem;
    }
    .item-category {
      font-size: 0.85rem;
      color: #6c757d;
    }
    .item-category::before {
      content: '•';
      margin-right: 1rem;
    }
  `]
})
export class AnnouncementComponent {
  announcements: Announcement[] = [
    { title: 'Swimming Pool Maintenance', description: 'The pool will be closed for maintenance work.', date: 'Oct 17, 2025', category: 'Maintenance', priority: 'High' },
    { title: 'New Gym Equipment Arrival', description: 'New state-of-the-art gym equipment has been installed.', date: 'Oct 15, 2025', category: 'Facilities', priority: 'Medium' },
    { title: 'Fire Safety Drill - October 22', description: 'Mandatory fire safety drill scheduled for next week.', date: 'Oct 12, 2025', category: 'Safety', priority: 'High' },
    { title: 'Holiday Decorating Contest', description: 'Join our annual holiday decoration competition.', date: 'Oct 10, 2025', category: 'Community', priority: 'Low' },
    { title: 'Parking Permit Renewal', description: 'Annual parking permits need to be renewed by November 1st.', date: 'Oct 8, 2025', category: 'Administrative', priority: 'Medium' },
  ];
}
