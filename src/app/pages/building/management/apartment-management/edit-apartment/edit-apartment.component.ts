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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApartmentService, ApartmentUpdateDto } from '../../../../../services/building/apartment.service';
import { map, switchMap, finalize, catchError } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

type AptType = 'Small' | 'Medium' | 'Big' | 'Large';
type ApartmentStatus = 'Còn Trống' | 'Đang Bảo Trì' | 'Đã Bán' | 'Đã Trả Phòng' | 'Đã Đóng';

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
  selector: 'app-edit-apartment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-apartment.component.html',
  styleUrls: ['./edit-apartment.component.css']
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
  private buildingId: string | null = null;

  private codeUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value: string = (control.value ?? '').toString().trim();
      if (!value) return of(null);
      if (!this.buildingId) return of(null);
      return this.apartmentService
        .isCodeUniqueInBuilding(this.buildingId, value, this.apartmentId ?? undefined)
        .pipe(map(isUnique => (isUnique ? null : { codeTakenInBuilding: true })));
    };
  }

  readonly editableStatuses: ApartmentStatus[] = ['Còn Trống', 'Đang Bảo Trì'];

  form = this.fb.group(
    {
      code: this.fb.control<string>('', {
        validators: [Validators.required],
        asyncValidators: [this.codeUniqueValidator()],
        updateOn: 'blur',
        nonNullable: true
      }),
      type: this.fb.control<AptType | ''>('', { validators: [Validators.required], nonNullable: true }),
      area: this.fb.control<number>(0, { validators: [Validators.required, Validators.min(1)], nonNullable: true }),
      status: this.fb.control<ApartmentStatus | ''>('', {
        validators: [Validators.required],
        nonNullable: true
      }),
    },
    { validators: [areaByTypeValidator()] }
  );

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(pm => pm.get('id')),
        switchMap(id => {
          if (!id) {
            this.error.set('Không tìm thấy ID căn hộ trong URL.');
            this.isLoading.set(false);
            return EMPTY;
          }
          this.apartmentId = id;
          this.isLoading.set(true);
          this.error.set(null);
          this.success.set(null);

          return this.apartmentService.getApartmentById(id).pipe(
            catchError(err => {
              this.error.set('Không thể tải dữ liệu căn hộ.');
              console.error(err);
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false))
          );
        })
      )
      .subscribe(apartment => {
        if (!apartment) return;

        this.apartmentCode.set(apartment.code);
        this.buildingId = apartment.buildingId;

        const status = apartment.status as ApartmentStatus;

        if (status === 'Đã Bán' || status === 'Đã Trả Phòng' || status === 'Đã Đóng') {
          this.error.set('Không được phép chỉnh sửa căn hộ này!');
          this.form.disable();
          return;
        }

        this.form.patchValue({
          code: apartment.code,
          type: (['Small', 'Medium', 'Big', 'Large'].includes(apartment.type)
            ? apartment.type as AptType
            : ''),
          area: apartment.area ?? 0,
          status: this.editableStatuses.includes(status) ? status : 'Còn Trống'
        });

        this.form.get('type')?.valueChanges.subscribe(() => {
          this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        });

        this.form.controls.code.updateValueAndValidity();
      });
  }


  get currentRange() {
    const t = this.form.get('type')?.value as AptType | '';
    return t ? TYPE_RANGES[t] : null;
  }
  onSubmit(): void {
    if (this.form.invalid || !this.apartmentId || this.form.disabled) return;

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const updateDto: ApartmentUpdateDto = {
      code: this.form.value.code!,
      type: this.form.value.type! as AptType,
      area: this.form.value.area!,
      status: this.form.value.status! as string
    };

    this.apartmentService.updateApartment(this.apartmentId, updateDto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Cập nhật căn hộ thành công!');
        this.apartmentCode.set(updateDto.code!);
        setTimeout(() => this.router.navigate(['/manager/manage-apartment']), 900);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Cập nhật thất bại.');
        console.error(err);
      }
    });
  }

}
