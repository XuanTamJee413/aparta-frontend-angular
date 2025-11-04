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
  templateUrl: './create-asset.component.html',
  styleUrls: ['./create-asset.component.css']
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
      quantity: [0, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]]
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
    const c = this.assetForm.get(controlName);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  onCancel(): void {
    this.router.navigate(['manager/manage-asset']);
  }

  onSubmit(): void {
    this.assetForm.markAllAsTouched();
    if (this.assetForm.invalid) return;

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
            specificError = 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại các trường (ví dụ: Số lượng phải là số nguyên).';
          } else if (err.error && err.error.errors) {
            specificError = Object.values(err.error.errors).flat().join(' ');
          } else {
            specificError = 'Dữ liệu gửi lên không hợp lệ (lỗi 400).';
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
