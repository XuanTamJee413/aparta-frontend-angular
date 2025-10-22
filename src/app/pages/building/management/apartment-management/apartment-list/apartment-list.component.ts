import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface Apartment {
  id: string;
  name: string;
  area: number;
  residents: number;
  status: 'Đang thuê' | 'Còn trống';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <header>
          <h1>Quản lý Căn hộ</h1>
          <p>Danh sách căn hộ với các thông tin:</p>
        </header>

        <div class="search-container">
          <div class="search-wrapper">
            <div class="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              class="search-input"
              placeholder="Tìm theo mã, tên căn hộ, số cư dân hoặc trạng thái..."
              [(ngModel)]="searchTerm"
              (input)="filterApartments()"
            />
          </div>
        </div>

        <div class="table-container">
          <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Mã căn hộ</th>
                      <th>Tên căn hộ</th>
                      <th>Diện tích</th>
                      <th>Số cư dân</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let apartment of filteredApartments">
                      <td class="font-medium">{{ apartment.id }}</td>
                      <td>{{ apartment.name }}</td>
                      <td>{{ apartment.area }} m²</td>
                      <td>{{ apartment.residents }}</td>
                      <td>
                        <span class="status-badge"
                          [ngClass]="{
                            'status-rented': apartment.status === 'Đang thuê',
                            'status-available': apartment.status === 'Còn trống'
                          }">
                          <svg class="status-dot" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {{ apartment.status }}
                        </span>
                      </td>
                      <td class="actions">
                        <a href="#" class="action-view">
                          <svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          Xem
                        </a>
                        <button class="action-edit-btn">
                          <svg class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                          Sửa
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="filteredApartments.length === 0">
                        <td colspan="6" class="no-results">
                            Không tìm thấy căn hộ nào phù hợp.
                        </td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </div>

        <div class="pagination">
            <span class="page-info">
                Trang <span class="font-medium">1</span> / <span class="font-medium">1</span>
            </span>
            <div class="pagination-buttons">
                <button class="pagination-btn" disabled>
                    Trước
                </button>
                <button class="pagination-btn" disabled>
                    Tiếp
                </button>
            </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }
    .container {
        background-color: #f9fafb;
        min-height: 100vh;
        padding: 2rem;
    }
    .card {
        max-width: 1280px;
        margin: 0 auto;
        background-color: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 2rem;
    }
    header h1 {
        font-size: 1.875rem;
        font-weight: bold;
        color: #1f2937;
    }
    header p {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
    }
    .search-container {
        margin-top: 1.5rem;
    }
    .search-wrapper {
        position: relative;
    }
    .search-icon {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        padding-left: 0.75rem;
        display: flex;
        align-items: center;
        pointer-events: none;
    }
    .search-icon svg {
        height: 1.25rem;
        width: 1.25rem;
        color: #9ca3af;
    }
    .search-input {
        display: block;
        width: 100%;
        padding-left: 2.5rem;
        padding-right: 0.75rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background-color: white;
        color: #111827;
    }
    .search-input:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 1px #4f46e5;
    }
    .table-container {
        margin-top: 1.5rem;
        overflow-x: auto;
    }
    .table-wrapper {
        min-width: 100%;
        border-bottom: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    .data-table {
        min-width: 100%;
        border-collapse: collapse;
    }
    .data-table thead {
        background-color: #f9fafb;
    }
    .data-table th {
        padding: 0.75rem 1.5rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 500;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .data-table tbody {
        background-color: white;
        divide-y: 1px solid #e5e7eb;
    }
    .data-table td {
        padding: 1rem 1.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        white-space: nowrap;
        border-bottom: 1px solid #e5e7eb;
    }
    .data-table td.font-medium {
        font-weight: 500;
        color: #111827;
    }
    .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    .status-rented {
        background-color: #dbeafe;
        color: #1e40af;
    }
    .status-available {
        background-color: #d1fae5;
        color: #065f46;
    }
    .status-dot {
        height: 0.5rem;
        width: 0.5rem;
        margin-right: 0.375rem;
        margin-left: -0.125rem;
    }
    .status-rented .status-dot {
        color: #60a5fa;
    }
    .status-available .status-dot {
        color: #34d399;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .action-view {
      color: #6b7280;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    .action-view:hover {
      color: #4f46e5;
    }
    .action-icon {
      height: 1rem;
      width: 1rem;
      margin-right: 0.25rem;
    }
    .action-edit-btn {
      background-color: #4f46e5;
      color: white;
      font-weight: bold;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .action-edit-btn:hover {
      background-color: #4338ca;
    }
    .no-results {
        text-align: center;
        padding: 2.5rem;
        color: #6b7280;
    }
    .pagination {
        margin-top: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
    .page-info {
        font-size: 0.875rem;
        color: #374151;
    }
    .page-info .font-medium {
        font-weight: 500;
    }
    .pagination-buttons {
        display: flex;
        align-items: center;
        margin-left: 1rem;
    }
    .pagination-btn {
        padding: 0.25rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
        background-color: white;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
    }
    .pagination-btn:hover {
        background-color: #f9fafb;
    }
    .pagination-btn:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
    .pagination-buttons button + button {
        margin-left: 0.5rem;
    }
  `]
})
export class ApartmentList implements OnInit {
  searchTerm: string = '';

  allApartments: Apartment[] = [
    { id: 'A-101', name: 'Lotus A-101', area: 72, residents: 2, status: 'Đang thuê' },
    { id: 'A-102', name: 'Lotus A-102', area: 65, residents: 1, status: 'Đang thuê' },
    { id: 'B-203', name: 'Sunrise B-203', area: 88, residents: 2, status: 'Đang thuê' },
    { id: 'C-305', name: 'Riverside C-305', area: 54, residents: 1, status: 'Đang thuê' },
    { id: 'D-407', name: 'Green D-407', area: 102, residents: 2, status: 'Đang thuê' },
    { id: 'E-509', name: 'Skyline E-509', area: 76, residents: 1, status: 'Đang thuê' },
    { id: 'F-610', name: 'Harmony F-610', area: 63, residents: 2, status: 'Đang thuê' },
    { id: 'G-711', name: 'Central G-711', area: 90, residents: 1, status: 'Đang thuê' },
    { id: 'H-801', name: 'Orchid H-801', area: 120, residents: 3, status: 'Còn trống' },
  ];

  filteredApartments: Apartment[] = [];

  constructor() {}

  ngOnInit(): void {
    this.filteredApartments = this.allApartments;
  }

  filterApartments(): void {
    if (!this.searchTerm) {
      this.filteredApartments = this.allApartments;
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

    this.filteredApartments = this.allApartments.filter(apartment =>
      apartment.id.toLowerCase().includes(lowerCaseSearchTerm) ||
      apartment.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      apartment.residents.toString().includes(lowerCaseSearchTerm) ||
      apartment.status.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
}

