import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AssetManagementService,
  BuildingDto,
  AssetCreateDto
} from '../../../../../services/management/asset-management/asset-management.service';



@Component({
  selector: 'app-create-asset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="content">
      <div class="container-fluid p-0">
        <h1 class="h3 mb-3">Thêm Tài sản mới</h1>

        <div class="row">
          <div class="col-12 col-lg-8 col-xl-6">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Thông tin tài sản</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="assetForm" (ngSubmit)="onSubmit()">


                  <div class="mb-3">
                    <label for="buildingId" class="form-label">Tòa nhà</label>
                    <select
                      id="buildingId"
                      class="form-select"
                      formControlName="buildingId"
                      [class.is-invalid]="isInvalid('buildingId')">


                      @if (buildingsLoading()) {
                        <option [value]="null" disabled>Đang tải danh sách tòa nhà...</option>
                      }

                      @else if (buildingsError()) {
                        <option [value]="null" disabled>Lỗi: {{ buildingsError() }}</option>
                      }
                      @else {
                        <option [value]="null" disabled>-- Vui lòng chọn một tòa nhà --</option>
                        @for (building of buildings(); track building.buildingId) {
                          <option [value]="building.buildingId">
                            {{ building.name }}
                          </option>
                        }
                      }
                    </select>
                    @if (isInvalid('buildingId')) {
                      <div class="invalid-feedback">
                        Vui lòng chọn một tòa nhà.
                      </div>
                    }
                  </div>


                  <div class="mb-3">
                    <label for="info" class="form-label">Tên Tài sản</label>
                    <input
                      type="text"
                      class="form-control"
                      id="info"
                      formControlName="info"
                      placeholder="Ví dụ: Bóng đèn, Bàn, Ghế..."
                      [class.is-invalid]="isInvalid('info')"
                    />
                    @if (isInvalid('info')) {
                      <div class="invalid-feedback">
                        Tên tài sản không được để trống.
                      </div>
                    }
                  </div>


                  <div class="mb-3">
                    <label for="quantity" class="form-label">Số Lượng</label>
                    <input
                      type="number"
                      class="form-control"
                      id="quantity"
                      formControlName="quantity"
                      [class.is-invalid]="isInvalid('quantity')"
                    />
                    @if (isInvalid('quantity')) {
                      <div class="invalid-feedback">
                        @if (assetForm.get('quantity')?.hasError('required')) {
                          Số lượng không được để trống.
                        }
                        @if (assetForm.get('quantity')?.hasError('min')) {
                          Số lượng phải ít nhất là 0.
                        }
                         @if (assetForm.get('quantity')?.hasError('pattern')) {
                          Số lượng phải là một số nguyên.
                        }
                      </div>
                    }
                  </div>


                  @if (errorMessage()) {
                    <div class="alert alert-danger">
                      {{ errorMessage() }}
                    </div>
                  }


                  <div class="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="onCancel()">
                      Hủy
                    </button>
                    <button
                      type="submit"
                      class="btn btn-success"
                      [disabled]="assetForm.invalid || isSubmitting()">
                      @if (isSubmitting()) {
                        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Đang lưu...
                      } @else {
                        Lưu
                      }
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: ``
})
export class CreateAsset implements OnInit {

  assetForm!: FormGroup;

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  buildings = signal<BuildingDto[]>([]);
  buildingsLoading = signal(true);
  buildingsError = signal<string | null>(null);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private assetService = inject(AssetManagementService);

  ngOnInit(): void {
    this.assetForm = this.fb.group({
      buildingId: [null, Validators.required],
      info: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0), Validators.pattern("^[0-9]*$")]]
    });

    this.loadBuildings();
  }


  loadBuildings(): void {
    this.buildingsLoading.set(true);
    this.buildingsError.set(null);

    this.assetService.getBuildings().subscribe({
      next: (data) => {
        this.buildings.set(data);
        this.buildingsLoading.set(false);
      },
      error: (err) => {
        this.buildingsLoading.set(false);
        this.buildingsError.set('Không thể tải danh sách tòa nhà.');
        console.error('Lỗi khi tải buildings:', err);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.assetForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onCancel(): void {
    this.router.navigate(['manager/manage-asset']);
  }

  onSubmit(): void {
    this.assetForm.markAllAsTouched();
    if (this.assetForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const createDto: AssetCreateDto = this.assetForm.value;

    this.assetService.createAsset(createDto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['manager/manage-asset']);
      },
      error: (err) => {
        this.isSubmitting.set(false);


        let specificError = 'Vui lòng thử lại.';
        if (err.status === 400) {
          if (err.error && typeof err.error.title === 'string' && err.error.title.includes('JSON')) {
              specificError = "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại các trường (ví dụ: Số lượng phải là số nguyên).";
          } else if (err.error && err.error.errors) {
              specificError = Object.values(err.error.errors).flat().join(' ');
          } else {
              specificError = "Dữ liệu gửi lên không hợp lệ (lỗi 400).";
          }
        } else if (err.error?.message) {
            specificError = err.error.message;
        } else if (err.message) {
            specificError = err.message;
        }

        this.errorMessage.set(`Thêm mới thất bại. ${specificError}`);
        console.error('Lỗi khi tạo asset:', err);
      }
    });
  }
}


