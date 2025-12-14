import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import {
  Vehicle,
  VehicleCreateDto,
  VehicleQueryParameters,
  VehicleService,
  Apartment
} from '../../../../services/operation/vehicle.service';

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
  isDeleting = signal<string | null>(null);
  listSuccess = signal<string | null>(null);
  listError = signal<string | null>(null);
  readonly vehicleTypes = ['Xe đạp', 'Xe ô tô', 'Xe máy', 'Xe điện'];

  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  apartmentId: string | undefined = this.authService.user()?.apartment_id;
  apartmentCode: string | null = null;

  myVehicles = signal<Vehicle[]>([]);
  isLoadingList = signal(false);

  form = this.fb.group({
    vehicleNumber: ['', [Validators.required, Validators.minLength(4)]],
    info: ['', [Validators.required]]
  });

  get vehiclePlaceholder(): string {
    const type = this.form.value.info;
    if (type === 'Xe đạp') {
      const code = this.apartmentCode ?? 'MãCănHộ';
      return `Ví dụ: ${code}-01 (xe đạp: Mã căn hộ của bạn -2 số)`;
    }
    return 'Ví dụ: 29A-12345';
  }

  ngOnInit(): void {
    if (!this.apartmentId) {
      this.error.set(
        'Không tìm thấy thông tin căn hộ. Vui lòng đăng nhập lại bằng tài khoản cư dân.'
      );
      this.form.disable();
    } else {
      this.loadApartmentInfo();
      this.loadMyVehicles();
    }

    this.form.setValidators(this.vehiclePlateValidator());
  }

  private vehiclePlateValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const type = group.get('info')?.value as string | null;
      const raw = ((group.get('vehicleNumber')?.value as string) || '').trim();

      if (!raw || !type) {
        return null;
      }

      if (type === 'Xe đạp') {
        if (!this.apartmentCode) {
          return null;
        }
        const bikeRegex = new RegExp(`^${this.apartmentCode}-\\d{2}$`);
        if (!bikeRegex.test(raw)) {
          return { bikePlateFormat: true };
        }
        return null;
      }

      const otherRegex = /^\d{2}[A-Za-z]-\d{5}$/;
      if (!otherRegex.test(raw)) {
        return { plateFormat: true };
      }

      return null;
    };
  }

  loadApartmentInfo(): void {
    if (!this.apartmentId) return;

    this.vehicleService.getApartmentById(this.apartmentId).subscribe({
      next: (apt: Apartment) => {
        this.apartmentCode = apt.code;
        this.form.updateValueAndValidity();
      },
      error: (err) => {
        console.error('Không lấy được thông tin căn hộ:', err);
        this.apartmentCode = null;
      }
    });
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

    const vehicleNumberRaw = this.form.value.vehicleNumber!.trim();
    const vehicleType = this.form.value.info!;

    if (vehicleType === 'Xe đạp' && this.apartmentCode) {
      const regex = new RegExp(`^${this.apartmentCode}-\\d{2}$`);
      if (!regex.test(vehicleNumberRaw)) {
        this.submitting.set(false);
        this.error.set(
          `Đối với xe đạp, biển số phải có dạng ${this.apartmentCode}-XX. ` +
            `Ví dụ: ${this.apartmentCode}-01 (XX là 2 số tự chọn).`
        );
        return;
      }
    } else if (vehicleType !== 'Xe đạp') {
      const otherRegex = /^\d{2}[A-Za-z]-\d{5}$/;
      if (!otherRegex.test(vehicleNumberRaw)) {
        this.submitting.set(false);
        this.error.set(
          'Biển số xe không đúng định dạng. Định dạng đúng: XXY-XXXXX. Ví dụ: 29A-12345.'
        );
        return;
      }
    }

    const payload: VehicleCreateDto = {
      apartmentId: this.apartmentId,
      vehicleNumber: vehicleNumberRaw,
      info: vehicleType,
      status: 'Chờ duyệt'
    };

    this.vehicleService.createVehicle(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Đăng ký phương tiện thành công! Vui lòng chờ duyệt.');
        this.form.reset({ info: '' });
        this.loadMyVehicles();
         setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.submitting.set(false);
        const backendMessage = err?.error?.message as string | undefined;

        if (err.status === 409) {
          this.error.set(backendMessage || 'Biển số xe đã tồn tại, vui lòng nhập lại!');
        } else {
          this.error.set(
            backendMessage || 'Đã xảy ra lỗi khi đăng ký phương tiện. Vui lòng thử lại sau.'
          );
        }

        this.success.set(null);
        console.error('Lỗi khi đăng ký xe:', err);
      }
    });
  }
 onDelete(vehicle: Vehicle): void {
    if (vehicle.status === 'Đã duyệt') return;

    const confirmDelete = confirm(
      `Bạn có chắc chắn muốn hủy đăng ký cho xe biển số "${vehicle.vehicleNumber}" không?`
    );
    if (!confirmDelete) return;
    this.isDeleting.set(vehicle.vehicleId);
    this.listSuccess.set(null);
    this.listError.set(null);
    this.vehicleService.deleteVehicle(vehicle.vehicleId).subscribe({
      next: () => {
        this.listSuccess.set('Đã hủy đăng ký phương tiện thành công.');
        this.isDeleting.set(null);
        this.loadMyVehicles();
        setTimeout(() => this.listSuccess.set(null), 3000);
      },
      error: (err) => {
        console.error('Lỗi khi xóa:', err);
        this.isDeleting.set(null);
        this.listError.set(
          err?.error?.message || 'Không thể hủy đăng ký phương tiện. Vui lòng thử lại sau.'
        );
      }
    });
  }
}
