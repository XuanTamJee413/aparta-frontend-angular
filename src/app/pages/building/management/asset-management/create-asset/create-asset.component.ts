import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AssetManagementService,
  BuildingDto,
  AssetCreateDto
} from '../../../../../services/management/asset-management/asset-management.service';
import { map, of, switchMap, catchError } from 'rxjs';

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
      info: [
        '',
        Validators.required,
        [this.uniqueInfoInBuildingValidator()]
      ],
      quantity: [0, [Validators.required, Validators.min(0), Validators.max(9999), Validators.pattern('^[0-9]*$')]]
    });

    this.assetForm.get('buildingId')!.valueChanges.subscribe(() => {
      this.assetForm.get('info')!.updateValueAndValidity({ emitEvent: false });
    });

    this.loadBuildings();
  }

  private uniqueInfoInBuildingValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const infoRaw = (control.value ?? '') as string;
      const buildingId = this.assetForm?.get('buildingId')?.value as string | null;

      if (!buildingId || !infoRaw?.trim()) return of(null);

      return this.assetService.checkAssetExists(buildingId, infoRaw).pipe(
        map(exists => (exists ? ({ assetExists: true } as ValidationErrors) : null)),
        catchError(() => of(null))
      );
    };
  }

  loadBuildings(): void {
    this.buildingsLoading.set(true);
    this.buildingsError.set(null);

    this.assetService.getMyBuildings().subscribe({
      next: (data: BuildingDto[]) => {
        this.buildings.set(data ?? []);
        this.buildingsLoading.set(false);

        if (!data || data.length === 0) {
          this.buildingsError.set('Tài khoản hiện không quản lý tòa nhà nào.');
        } else {
          this.buildingsError.set(null);
        }
      },
      error: (err: any) => {
        this.buildingsLoading.set(false);
        this.buildings.set([]);
        this.buildingsError.set('Không thể tải danh sách tòa nhà.');
        console.error('Lỗi khi tải buildings (my-buildings):', err);
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

    if (!this.buildings() || this.buildings().length === 0) {
      this.errorMessage.set('Bạn không được phân quyền tạo tài sản cho tòa nhà nào.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const createDto: AssetCreateDto = this.assetForm.value;

    this.assetService.checkAssetExists(createDto.buildingId, createDto.info).pipe(
      switchMap((exists: boolean) => {
        if (exists) {
          this.isSubmitting.set(false);
          this.assetForm.get('info')?.setErrors({ assetExists: true });
          this.assetForm.get('info')?.markAsTouched();
          this.errorMessage.set('Thêm mới thất bại. Tài sản đã tồn tại trong tòa nhà này, vui lòng nhập tên khác.');
          return of(null);
        }
        return this.assetService.createAsset(createDto);
      }),
      catchError((err: any) => {
        return of({ error: err });
      })
    ).subscribe({
      next: (res: any) => {
        if (!res) return;
        if (res && (res as any).error) {
          const err = (res as any).error;
          this.isSubmitting.set(false);
          this.handleCreateError(err);
          return;
        }

        this.isSubmitting.set(false);
        this.router.navigate(['manager/manage-asset']);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.handleCreateError(err);
      }
    });
  }

  private handleCreateError(err: any) {
    let specificError = 'Vui lòng thử lại.';
    if (err && err.status === 400) {
      if (err.error && typeof err.error.title === 'string' && err.error.title.includes('JSON')) {
        specificError = 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại các trường (ví dụ: Số lượng phải là số nguyên).';
      } else if (err.error && err.error.errors) {
        specificError = Object.values(err.error.errors).flat().join(' ');
      } else {
        specificError = 'Dữ liệu gửi lên không hợp lệ (lỗi 400).';
      }
    } else if (err?.error?.message) {
      specificError = err.error.message;
    } else if (err?.message) {
      specificError = err.message;
    }
    this.errorMessage.set(`Thêm mới thất bại. ${specificError}`);
    console.error('Lỗi khi tạo asset:', err);
  }
}
