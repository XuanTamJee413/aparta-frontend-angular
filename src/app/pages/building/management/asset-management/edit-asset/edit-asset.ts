import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { take, map, catchError } from 'rxjs/operators';
import {
  AssetDto,
  AssetManagementService,
  AssetUpdateDto,
  AssetView,
  BuildingDto
} from '../../../../../services/management/asset-management/asset-management.service';

function positiveIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) return { positiveInteger: true };
    return null;
  };
}

@Component({
  selector: 'app-edit-asset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-asset.html',
  styleUrls: ['./edit-asset.css']
})
export class EditAsset implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private assetService = inject(AssetManagementService);

  private readonly BACK_URL = '/manager/manage-asset';

  isLoading = signal(true);
  isSaving = signal(false);
  error = signal<string | null>(null);

  id = '';
  asset = signal<AssetDto | AssetView | null>(null);
  buildings = signal<BuildingDto[]>([]);

  form = this.fb.group({
    buildingName: [{ value: '', disabled: true }, [Validators.required]],
    info: ['', [Validators.required, Validators.maxLength(200)]],
    quantity: [null as number | null, [Validators.required, positiveIntegerValidator(), Validators.max(9999)]]
  });

  ngOnInit(): void {
    const p = this.route.snapshot.paramMap;
    this.id = p.get('id') ?? p.get('assetId') ?? p.get('assetID') ?? '';
    if (!this.id) {
      this.error.set('Không tìm thấy ID tài sản trên URL.');
      this.isLoading.set(false);
      return;
    }
    this.loadData();
  }

  private normalize(s: string | null | undefined): string {
    return (s ?? '').toString().trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private uniqueInfoInBuildingValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const infoRaw = (control.value ?? '') as string;

      if (!infoRaw.trim()) return of(null);

      const a = this.asset();
      const buildingId = a?.buildingId ?? null;
      if (!buildingId) return of(null);


      if (this.normalize(infoRaw) === this.normalize(a?.info ?? '')) {
        return of(null);
      }

      return this.assetService.checkAssetExists(buildingId, infoRaw, this.id).pipe(
        map(exists => (exists ? ({ assetExists: true } as ValidationErrors) : null)),
        catchError(() => of(null))
      );
    };
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      asset: this.assetService.getAssetById(this.id),
      buildings: this.assetService.getBuildings().pipe(take(1))
    })
      .pipe(take(1))
      .subscribe({
        next: ({ asset, buildings }) => {
          if (!asset) {
            this.error.set('Không tìm thấy tài sản.');
            return;
          }
          this.asset.set(asset);
          this.buildings.set(buildings ?? []);

          const found = buildings.find(b => b.buildingId === asset.buildingId);
          const buildingName =
            (asset as AssetView)?.buildingName ||
            found?.name ||
            (found?.buildingCode ? `Mã: ${found.buildingCode}` : '(Không có tên)');

          this.form.patchValue({
            buildingName: buildingName || '(Không có tên)',
            info: asset.info ?? '',
            quantity: asset.quantity ?? null
          });

          const infoCtrl = this.form.get('info');
          infoCtrl?.setAsyncValidators(this.uniqueInfoInBuildingValidator());
          infoCtrl?.updateValueAndValidity({ emitEvent: false });
        },
        error: () => this.error.set('Lỗi tải dữ liệu tài sản.'),
        complete: () => this.isLoading.set(false)
      });
  }

  hasError(ctrl: 'info' | 'quantity', err: string): boolean {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  onSubmit(): void {
    if (this.form.invalid || !this.asset()) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);

    const payload: AssetUpdateDto = {
      info: this.form.value.info ?? null,
      quantity: this.form.value.quantity ?? null
    };

    this.assetService.updateAsset(this.id, payload).pipe(take(1)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigateByUrl(this.BACK_URL);
      },
      error: () => {
        this.isSaving.set(false);
        this.error.set('Cập nhật thất bại. Vui lòng thử lại.');
      }
    });
  }

  onCancel(): void {
    this.router.navigateByUrl(this.BACK_URL);
  }
}
