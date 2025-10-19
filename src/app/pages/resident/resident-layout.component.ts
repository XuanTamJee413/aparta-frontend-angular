import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-resident-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="resident-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>MyBuilding</h2>
        </div>
        <nav class="sidebar-nav">
          <ul>
            <li>
              <a routerLink="dashboard" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a routerLink="bills" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>Bills</span>
              </a>
            </li>
            <li>
              <a routerLink="issues" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>Issues</span>
              </a>
            </li>
            <li>
              <a routerLink="announcements" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span>Announcements</span>
              </a>
            </li>
            <li>
              <a routerLink="visitors" routerLinkActive="active">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Visitors</span>
              </a>
            </li>
             <li>
              <a routerLink="facilities" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 10c-2.1 0-4.3 1.2-5.9 3.3-1.4 1.8-2.6 4.2-2.6 6.7h17c0-2.5-1.2-4.9-2.6-6.7-1.6-2.1-3.8-3.3-5.9-3.3z"></path><path d="M12 10V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12"></path><path d="M2 22h20"></path><path d="M15 10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1z"></path></svg>
                <span>Facilities</span>
              </a>
            </li>
             <li>
              <a routerLink="chat" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Chat</span>
              </a>
            </li>
            <li>
              <a routerLink="profile" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Profile</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <header class="top-bar">
          <div class="user-info">
            <span>{{ userName }}</span>
            <small>Resident</small>
          </div>
          <div class="avatar">{{ userInitials }}</div>
        </header>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .resident-layout {
      display: flex;
      height: 100%;
    }
    .sidebar {
      width: 240px;
      background-color: #ffffff;
      border-right: 1px solid #e9ecef;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 0 1.5rem 2rem 1.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0d6efd;
    }
    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.75rem 1.5rem;
      margin: 0 1rem;
      color: #5a6470;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
      border-radius: 8px;
    }
    .sidebar-nav a:hover {
      background-color: #f8f9fa;
    }
    .sidebar-nav a.active {
      background-color: #e7f3ff;
      color: #0d6efd;
    }
    .sidebar-nav svg {
      width: 20px;
      height: 20px;
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #f7f9fc;
      overflow-y: auto;
    }
    .top-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 1rem 2.5rem;
      background-color: #ffffff;
      border-bottom: 1px solid #e9ecef;
      height: 70px;
    }
    .user-info {
      text-align: right;
      margin-right: 1rem;
    }
    .user-info span { font-weight: 600; color: #333; }
    .user-info small { color: #6c757d; display: block; }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #0d6efd;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .page-content {
      flex: 1;
      padding: 2.5rem;
    }
  `]
})
export class ResidentLayoutComponent {
  userName = 'John Anderson';

  get userInitials(): string {
    const names = this.userName.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0][0];
  }
}

