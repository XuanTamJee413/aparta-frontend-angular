import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ApartmentService,
  ApartmentBulkCreateDto,
  ApartmentBulkRoomConfig,
  BuildingOption
} from '../../../../../services/building/apartment.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

type AptType = 'Small' | 'Medium' | 'Big' | 'Large';

const TYPE_RANGES: Record<AptType, { min: number; max: number }> = {
  Small: { min: 25, max: 45 },
  Medium: { min: 40, max: 55 },
  Big: { min: 55, max: 70 },
  Large: { min: 70, max: 80 },
};

function floorRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startFloor')?.value;
    const end = group.get('endFloor')?.value;
    if (start == null || end == null) return null;

    if (start <= 0 || end <= 0) {
      return { floorRange: 'Tầng phải lớn hơn 0.' };
    }
    if (end < start) {
      return { floorRange: 'Tầng kết thúc phải lớn hơn hoặc bằng tầng bắt đầu.' };
    }
    return null;
  };
}

function roomAreaByTypeValidator(): ValidatorFn {
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
  selector: 'app-generate-apartment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './generate-apartment.html',
  styleUrls: ['./generate-apartment.css']
})
export class GenerateApartment implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private aptService = inject(ApartmentService);

  buildings = signal<BuildingOption[]>([]);
  buildingsLoading = signal(true);
  buildingsError = signal<string | null>(null);

  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form: FormGroup = this.fb.group(
    {
      buildingId: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      startFloor: this.fb.control<number>(1, { validators: [Validators.required, Validators.min(1)], nonNullable: true }),
      endFloor: this.fb.control<number>(1, { validators: [Validators.required, Validators.min(1)], nonNullable: true }),
      rooms: this.fb.array<FormGroup>([])
    },
    { validators: [floorRangeValidator()] }
  );

  get roomsArray(): FormArray<FormGroup> {
    return this.form.get('rooms') as FormArray<FormGroup>;
  }

  get floorRangeError(): string | null {
    const err = this.form.errors?.['floorRange'];
    return typeof err === 'string' ? err : null;
  }


  ngOnInit(): void {
    this.aptService.getMyBuildings()
      .pipe(
        catchError(err => {
          console.error(err);
          this.buildingsError.set('Không thể tải danh sách tòa nhà.');
          return of([] as BuildingOption[]);
        }),
        finalize(() => this.buildingsLoading.set(false))
      )
      .subscribe(list => this.buildings.set(list));

    this.addRoom();
    this.addRoom();
  }

  addRoom(): void {
    const roomGroup = this.fb.group(
      {
        roomIndex: this.fb.control<number>(this.roomsArray.length + 1, {
          validators: [Validators.required, Validators.min(1)],
          nonNullable: true
        }),
        type: this.fb.control<AptType | ''>('', {
          validators: [Validators.required],
          nonNullable: true
        }),
        area: this.fb.control<number>(0, {
          validators: [Validators.required, Validators.min(1)],
          nonNullable: true
        })
      },
      { validators: [roomAreaByTypeValidator()] }
    );

    this.roomsArray.push(roomGroup);
  }

  removeRoom(index: number): void {
    if (this.roomsArray.length <= 1) return;
    this.roomsArray.removeAt(index);
  }

  getRoomError(i: number, controlName: 'roomIndex' | 'type' | 'area', errorKey: string): boolean {
    const ctrl = this.roomsArray.at(i).get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched) && ctrl.hasError(errorKey));
  }

  roomHasAreaRangeError(i: number): boolean {
    const group = this.roomsArray.at(i);
    return !!(group.errors?.['areaOutOfRange'] && (group.dirty || group.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const dto: ApartmentBulkCreateDto = {
      buildingId: value.buildingId!,
      startFloor: value.startFloor!,
      endFloor: value.endFloor!,
      rooms: this.roomsArray.controls.map(g => {
        const v = g.value;
        return {
          roomIndex: v.roomIndex!,
          type: v.type!,
          area: v.area!
        } as ApartmentBulkRoomConfig;
      })
    };

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    this.aptService.generateApartments(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Tạo hàng loạt căn hộ thành công!');
        setTimeout(() => this.router.navigate(['/manager/manage-apartment']), 900);
      },
      error: err => {
        this.submitting.set(false);
        console.error(err);
        this.error.set(err?.error?.message || 'Tạo hàng loạt căn hộ thất bại.');
      }
    });
  }
}
