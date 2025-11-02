import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApartmentService, ApartmentUpdateDto } from '../../../../../services/building/apartment.service';

@Component({
  selector: 'app-edit-apartment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="card">
        <header>
          <h1>Cập nhật Căn hộ: {{ apartmentCode() }}</h1>
          <p>Chỉnh sửa thông tin bên dưới và bấm Lưu.</p>
        </header>

        @if (isLoading()) {
          <div class="text-center" style="padding: 2rem;">
            <p>Đang tải dữ liệu...</p>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-container">

            <div class="form-group">
              <label for="code" class="form-label">Mã Căn hộ (Code)</label>
              <input id="code" type="text" class="form-control" formControlName="code" />
              @if (form.controls.code.invalid && (form.controls.code.dirty || form.controls.code.touched)) {
                <div class="form-error">Mã căn hộ là bắt buộc.</div>
              }
            </div>

            <div class="form-group">
              <label for="area" class="form-label">Diện tích (m²)</label>
              <input id="area" type="number" class="form-control" formControlName="area" />
              @if (form.controls.area.invalid && (form.controls.area.dirty || form.controls.area.touched)) {
                <div class="form-error">Diện tích phải là một số dương.</div>
              }
            </div>

            @if (success()) {
              <div class="alert-success">{{ success() }}</div>
            }
            @if (error()) {
              <div class="alert-danger">{{ error() }}</div>
            }

            <div class="form-actions">
              <a routerLink="/manager/manage-apartment" class="btn-secondary">Hủy</a>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="form.invalid || submitting()">
                @if (submitting()) {
                  <span>Đang lưu...</span>
                } @else {
                  <span>Lưu thay đổi</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; }
    .container { padding: 2rem; }
    .card {
      max-width: 768px;
      margin: 0 auto;
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      padding: 2rem;
    }
    header h1 { font-size: 1.5rem; font-weight: 600; color: #111827; }
    header p { margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280; }
    .form-container { margin-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-label { font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
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
    .form-error { font-size: 0.75rem; color: #dc2626; margin-top: 0.5rem; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
    .btn-primary, .btn-secondary {
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
    }
    .btn-primary {
      color: white;
      background-color: #4f46e5;
    }
    .btn-primary:hover:not(:disabled) { background-color: #4338ca; }
    .btn-primary:disabled { cursor: not-allowed; opacity: 0.5; }
    .btn-secondary {
      color: #374151;
      background-color: #e5e7eb;
    }
    .btn-secondary:hover { background-color: #d1d5db; }
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
  `]
})
export class EditApartment implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly apartmentService = inject(ApartmentService);

  isLoading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  apartmentCode = signal<string>('');

  private apartmentId: string | null = null;

  form = this.fb.group({
    code: ['', [Validators.required]],
    area: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.apartmentId = this.route.snapshot.paramMap.get('id');

    if (!this.apartmentId) {
      this.isLoading.set(false);
      this.error.set('Không tìm thấy ID căn hộ trong URL.');
      return;
    }

    this.apartmentService.getApartmentById(this.apartmentId).subscribe({
      next: (apartment) => {
        this.form.patchValue({
          code: apartment.code,
          area: apartment.area
        });
        this.apartmentCode.set(apartment.code);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Không thể tải dữ liệu căn hộ.');
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.apartmentId) return;

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const updateDto: ApartmentUpdateDto = {
      code: this.form.value.code!,
      area: this.form.value.area!
    };

    this.apartmentService.updateApartment(this.apartmentId, updateDto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Cập nhật căn hộ thành công!');
        this.apartmentCode.set(updateDto.code!);

        setTimeout(() => {
          this.router.navigate(['manager/manage-apartment']);
        }, 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Cập nhật thất bại.');
        console.error(err);
      }
    });
  }
}
