import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { VehicleCreateDto, VehicleService } from '../../../../services/operation/vehicle.service';
import { Vehicle, VehicleQueryParameters } from '../../../building/operation/vehicle-management/vehicle-list/vehicle-list';


@Component({
  selector: 'app-register-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],


  template: `
    <div class="container">
      <div class="card">
        <header>
          <h1>Đăng ký phương tiện</h1>
          <p>Vui lòng điền thông tin xe của bạn bên dưới.</p>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-container">

          <div class="form-group">
            <label for="vehicleNumber" class="form-label">Biển số xe</label>
            <input
              id="vehicleNumber"
              type="text"
              class="form-control"
              formControlName="vehicleNumber"
              placeholder="Ví dụ: 29-A1 123.45"
            />
            @if (form.controls.vehicleNumber.invalid && (form.controls.vehicleNumber.dirty || form.controls.vehicleNumber.touched)) {
              <div class="form-error">
                Biển số xe là bắt buộc.
              </div>
            }
          </div>

          <div class="form-group">
            <label for="info" class="form-label">Loại xe</label>
            <select id="info" class="form-select" formControlName="info">
              <option value="" disabled>-- Vui lòng chọn --</option>
              @for (type of vehicleTypes; track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>
            @if (form.controls.info.invalid && (form.controls.info.dirty || form.controls.info.touched)) {
              <div class="form-error">
                Vui lòng chọn loại xe.
              </div>
            }
          </div>

          @if (success()) {
            <div class="alert-success">
              {{ success() }}
            </div>
          }

          @if (error()) {
            <div class="alert-danger">
              {{ error() }}
            </div>
          }

          <div class="form-actions">
            <button
              type="submit"
              class="btn-primary"
              [disabled]="form.invalid || submitting()">
              @if (submitting()) {
                <span>Đang gửi...</span>
              } @else {
                <span>Đăng ký</span>
              }
            </button>
          </div>

        </form>
      </div>

      <div class="card list-card">
        <header>
          <h2>Phương tiện đã đăng ký</h2>
          <p>Danh sách các phương tiện thuộc căn hộ của bạn.</p>
        </header>

        @if (isLoadingList()) {
          <div class="text-center" style="padding: 2rem;">
            <p>Đang tải danh sách...</p>
          </div>
        } @else {
          <div class="table-container">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Biển số</th>
                    <th>Loại xe</th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  @for (vehicle of myVehicles(); track vehicle.vehicleId) {
                    <tr>
                      <td class="font-medium">{{ vehicle.vehicleNumber }}</td>
                      <td>{{ vehicle.info }}</td>
                      <td>{{ vehicle.createdAt | date: 'dd/MM/yyyy' }}</td>
                      <td>
                        @if (vehicle.status === 'Đã duyệt') {
                          <span class="status-approved">Đã duyệt</span>
                        } @else if (vehicle.status === 'Chờ duyệt') {
                          <span class="status-pending">Chờ duyệt</span>
                        } @else {
                          <span class="status-rejected">Bị từ chối</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="no-results">
                        Bạn chưa đăng ký phương tiện nào.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,

  styles: [`
    :host {
      font-family: 'Inter', sans-serif;
    }
    .container {
      padding: 2rem;
    }
    .card {
      max-width: 768px;
      margin: 0 auto;
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      padding: 2rem;
    }

    .list-card {
      margin-top: 2rem;
      max-width: 1280px;
    }

    header h1, header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }
    header p {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .form-container {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .form-control, .form-select {
      display: block;
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      background-color: white;
      color: #111827;
      box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .form-control:focus, .form-select:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 1px #4f46e5;
    }
    .form-error {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: 0.5rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
    .btn-primary {
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: white;
      background-color: #4f46e5;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: #4338ca;
    }
    .btn-primary:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
      padding: 0.75rem 1.25rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
    }
    .alert-success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
      padding: 0.75rem 1.25rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
    }

    .table-container {
        margin-top: 1.5rem;
        overflow-x: auto;
    }
    .table-wrapper {
        min-width: 100%;
        border-radius: 0.5rem;
        overflow: hidden;
        border: 1px solid #e5e7eb;
    }
    .data-table {
        min-width: 100%;
        border-collapse: collapse;
    }
    .data-table thead {
        background-color: #f9fafb;
    }
    .data-table th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 600;
        color: #4b5563;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e5e7eb;
    }
    .data-table tbody {
        background-color: white;
    }
    .data-table tbody tr:not(:last-child) {
      border-bottom: 1px solid #f3f4f6;
    }
    .data-table td {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #374151;
        white-space: nowrap;
    }
     .data-table tbody tr:hover {
       background-color: #f9fafb;
     }
    .data-table td.font-medium {
        font-weight: 500;
        color: #111827;
    }
    .status-approved {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #065f46;
      background-color: #d1fae5;
      border-radius: 9999px;
    }
    .status-pending {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #92400e;
      background-color: #fef3c7;
      border-radius: 9999px;
    }
    .status-rejected {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #991b1b;
      background-color: #fee2e2;
      border-radius: 9999px;
    }
    .no-results {
        text-align: center;
        padding: 2.5rem;
        color: #6b7280;
    }
  `]
})
export class RegisterVehicle implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly vehicleService = inject(VehicleService);

  readonly vehicleTypes = ['Xe đạp', 'Xe ô tô', 'Xe máy', 'Xe điện'];


  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);


  apartmentId: string | undefined = this.authService.user()?.apartment_id;


  myVehicles = signal<Vehicle[]>([]);
  isLoadingList = signal(false);

  form = this.fb.group({
    vehicleNumber: ['', [Validators.required, Validators.minLength(4)]],
    info: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (!this.apartmentId) {
      this.error.set('Không tìm thấy thông tin căn hộ. Vui lòng đăng nhập lại bằng tài khoản cư dân.');
      this.form.disable();
    } else {

      this.loadMyVehicles();
    }
  }


  loadMyVehicles(): void {
    if (!this.apartmentId) return;

    this.isLoadingList.set(true);

    const query: VehicleQueryParameters = {
      searchTerm: this.apartmentId,
      status: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    this.vehicleService.getVehicles(query).subscribe({
      next: (res) => {
        this.myVehicles.set(res.succeeded ? res.data : []);
        this.isLoadingList.set(false);
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách xe:', err);
        this.myVehicles.set([]);
        this.isLoadingList.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.apartmentId) {
      this.error.set('Lỗi: Không tìm thấy ID căn hộ.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: VehicleCreateDto = {
      apartmentId: this.apartmentId,
      vehicleNumber: this.form.value.vehicleNumber!,
      info: this.form.value.info!,
      status: 'Chờ duyệt'
    };

    this.vehicleService.createVehicle(payload).subscribe({
      next: (createdVehicle) => {
        this.submitting.set(false);
        this.success.set('Đăng ký phương tiện thành công! Trạng thái: Chờ duyệt.');
        this.form.reset({ info: '' });


        this.loadMyVehicles();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Trùng Biển Số Xe, vui lòng nhập lại!');
        this.success.set(null);
        console.error('Lỗi khi đăng ký xe:', err);
      }
    });
  }
}
