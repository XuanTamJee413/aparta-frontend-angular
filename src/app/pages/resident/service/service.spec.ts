import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ServiceRequest {
  id: string;
  title: string;
  category: string;
  status: 'In-Progress' | 'Resolved' | 'Pending';
  date: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Maintenance & Service</h1>
        <p class="subtitle">Report problems and track their status</p>
      </header>

      <!-- FORM BÁO CÁO SỰ CỐ MỚI -->
      <section class="card">
        <h3 class="card-title">Report New Issue</h3>
        <p class="card-subtitle">Let us know about any problems in your apartment or building.</p>
        <form class="report-form">
          <div class="form-group half">
            <label for="issueTitle">Issue Title</label>
            <input type="text" id="issueTitle" placeholder="Brief description of the issue">
          </div>
          <div class="form-group half">
            <label for="category">Category</label>
            <select id="category">
              <option value="" disabled selected>Select category</option>
              <option value="ac">Air Conditioning</option>
              <option value="plumbing">Plumbing</option>
              <option value="elevator">Elevator</option>
              <option value="security">Security</option>
            </select>
          </div>
          <div class="form-group full">
            <label for="description">Description</label>
            <textarea id="description" rows="3" placeholder="Provide detailed information about the issue..."></textarea>
          </div>
          <div class="form-group full">
            <label for="upload">Upload Photo (Optional)</label>
            <div class="upload-area">
              <div class="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <p>Click to upload or drag and drop</p>
              <small>PNG, JPG up to 10MB</small>
            </div>
          </div>
          <div>
            <button type="submit" class="btn btn-primary">Submit Issue Report</button>
          </div>
        </form>
      </section>

      <!-- BẢNG CÁC YÊU CẦU ĐÃ GỬI -->
      <section class="card">
        <h3 class="card-title">Your Requests</h3>
        <p class="card-subtitle">Track the status of your reported issues</p>
        <table class="requests-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            @for(req of requests; track req.id) {
              <tr>
                <td>{{ req.id }}</td>
                <td>{{ req.title }}</td>
                <td>{{ req.category }}</td>
                <td><span class="status" [ngClass]="req.status.toLowerCase().replace('-', '')">{{ req.status }}</span></td>
                <td>{{ req.date }}</td>
                <td>{{ req.lastUpdate }}</td>
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
    .status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
    }
    .status.inprogress { background-color: #cff4fc; color: #0dcaf0; }
    .status.resolved { background-color: #d1e7dd; color: #198754; }
    .status.pending { background-color: #fff3cd; color: #ffc107; }
    
    .report-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .form-group input, .form-group select, .form-group textarea {
      padding: 0.75rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
    }
    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px 12px;
    }
    .upload-area {
      border: 2px dashed #ced4da;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .upload-area:hover {
      border-color: #0d6efd;
    }
    .upload-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #f1f3f5;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }
    .upload-area p {
      margin: 0;
      font-weight: 500;
    }
    .upload-area small {
      color: #6c757d;
    }
    .requests-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .requests-table th, .requests-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    .requests-table th {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
    }
    .requests-table td {
      font-size: 0.9rem;
      color: #333;
    }
  `]
})
export class ServiceComponent {
  requests: ServiceRequest[] = [
    { id: '#MR-1234', title: 'AC not cooling properly', category: 'Air Conditioning', status: 'In-Progress', date: 'Oct 15, 2025', lastUpdate: '2 hours ago' },
    { id: '#MR-1233', title: 'Leaking faucet in bathroom', category: 'Plumbing', status: 'Resolved', date: 'Oct 12, 2025', lastUpdate: '3 days ago' },
    { id: '#MR-1232', title: 'Elevator stuck on 5th floor', category: 'Elevator', status: 'Resolved', date: 'Oct 10, 2025', lastUpdate: '5 days ago' },
    { id: '#MR-1231', title: 'Broken window lock', category: 'Security', status: 'Pending', date: 'Oct 8, 2025', lastUpdate: '7 days ago' },
  ];
}
