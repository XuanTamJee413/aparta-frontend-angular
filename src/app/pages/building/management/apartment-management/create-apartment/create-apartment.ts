import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ApartmentService,
  BuildingOption,
  ApartmentCreateDto
} from '../../../../../services/building/apartment.service';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

type AptType = 'Small' | 'Medium' | 'Big' | 'Large';

const TYPE_RANGES: Record<AptType, { min: number; max: number }> = {
  Small: { min: 25, max: 45 },
  Medium: { min: 40, max: 55 },
  Big: { min: 55, max: 70 },
  Large: { min: 70, max: 80 },
};

function areaByTypeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const type = group.get('type')?.value as AptType | '' | null;
    const areaCtrl = group.get('area');
    if (!type || !areaCtrl) return null;

    const raw = areaCtrl.value;
    const area = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isNaN(area)) return null;

    const range = TYPE_RANGES[type];
    const ok = area >= range.min && area <= range.max;
    return ok ? null : { areaOutOfRange: { type, min: range.min, max: range.max } };
  };
}

@Component({
  selector: 'app-create-apartment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-apartment.html',
  styleUrls: ['./create-apartment.css']
})
export class CreateApartment implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private aptService = inject(ApartmentService);

  isLoading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  buildings = signal<BuildingOption[]>([]);
  buildingsLoading = signal(true);
  buildingsError = signal<string | null>(null);

  private codeUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const code = (control.value ?? '').toString().trim();
      const buildingId = this.form.controls.buildingId.value ?? '';
      if (!code || !buildingId) return of(null);
      return this.aptService
        .isCodeUniqueInBuilding(buildingId, code)
        .pipe(map(isUnique => (isUnique ? null : { codeTakenInBuilding: true })));
    };
  }

  form = this.fb.group(
    {
      buildingId: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      code: this.fb.control<string>('', {
        validators: [Validators.required],
        asyncValidators: [this.codeUniqueValidator()],
        updateOn: 'blur',
        nonNullable: true
      }),
      type: this.fb.control<AptType | ''>('', { validators: [Validators.required], nonNullable: true }),
      area: this.fb.control<number>(0, { validators: [Validators.required, Validators.min(1)], nonNullable: true }),
    },
    { validators: [areaByTypeValidator()] }
  );

  ngOnInit(): void {
    this.aptService.getBuildings()
      .pipe(
        catchError(err => {
          console.error(err);
          this.buildingsError.set('Không thể tải danh sách tòa nhà.');
          return of([] as BuildingOption[]);
        }),
        finalize(() => this.buildingsLoading.set(false))
      )
      .subscribe(items => this.buildings.set(items));

    this.form.controls.buildingId.valueChanges.subscribe(() => {
      this.form.controls.code.updateValueAndValidity();
    });

    this.form.controls.type.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });
  }

  get currentRange() {
    const t = this.form.controls.type.value as AptType | '';
    return t ? TYPE_RANGES[t] : null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: ApartmentCreateDto = {
      buildingId: this.form.controls.buildingId.value!,
      code: this.form.controls.code.value!,
      type: this.form.controls.type.value! as AptType,
      area: this.form.controls.area.value!,
      status: 'Chưa Thuê'
    };

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    this.aptService.createApartment(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Tạo căn hộ thành công!');
        setTimeout(() => this.router.navigate(['/manager/manage-apartment']), 900);
      },
      error: err => {
        this.submitting.set(false);
        console.error(err);
        this.error.set(err?.error?.message || 'Tạo căn hộ thất bại.');
      }
    });
  }
}
