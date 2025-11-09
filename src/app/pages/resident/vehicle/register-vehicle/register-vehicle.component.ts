import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { Vehicle, VehicleCreateDto, VehicleQueryParameters, VehicleService } from '../../../../services/operation/vehicle.service';

@Component({
  selector: 'app-register-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register-vehicle.component.html',
  styleUrls: ['./register-vehicle.component.css']
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
      next: () => {
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
