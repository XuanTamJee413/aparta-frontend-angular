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
import { of, map, catchError } from 'rxjs';
import {
  HouseholdService,
  ApartmentMemberCreateDto,
  ApartmentMemberDto
} from '../../../../services/resident/household.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-register-household',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-household.component.html'
})
export class RegisterHousehold implements OnInit {

  private fb = inject(FormBuilder);
  private householdService = inject(HouseholdService);
  private auth = inject(AuthService);

  memberForm!: FormGroup;
  selectedFile: File | null = null;

  members = signal<ApartmentMemberDto[]>([]);
  isSubmitting = signal(false);
  isLoading = signal(false);
  loadError = signal<string | null>(null);
  submitError = signal<string | null>(null);
  submitSuccess = signal<string | null>(null);

  ngOnInit(): void {
    this.memberForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[\p{L}\s]+$/u)]],
      familyRole: [null, Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: [null],
      idNumber: [
        '',
        [Validators.pattern(/^\d+$/)],
        [this.idNumberUniqueValidator()]
      ],
      phoneNumber: ['', Validators.pattern(/^\d*$/)],
      nationality: ['Việt Nam'],
      faceImage: [null]
    }, {
      validators: this.spouseAgeValidator()
    });

    // Auto set gender
    this.memberForm.get('familyRole')!.valueChanges.subscribe(r => {
      if (r === 'Vợ' || r === 'Mẹ') this.memberForm.get('gender')?.setValue('Nữ');
      else if (r === 'Chồng' || r === 'Bố') this.memberForm.get('gender')?.setValue('Nam');
    });

    // CCCD required if age >= 14
    this.memberForm.get('dateOfBirth')!.valueChanges.subscribe(date => {
      const idCtrl = this.memberForm.get('idNumber');
      if (!date || !idCtrl) return;

      const age = this.calculateAge(date);

      if (age >= 14) {
        idCtrl.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
      } else {
        idCtrl.setValidators([Validators.pattern(/^\d+$/)]);
        idCtrl.setValue('');
      }

      idCtrl.updateValueAndValidity();
    });

    this.loadMembers();
  }

  private spouseAgeValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const role = group.get('familyRole')?.value;
      const dob = group.get('dateOfBirth')?.value;

      if (!role || !dob) return null;
      if (role !== 'Vợ' && role !== 'Chồng') return null;

      const age = this.calculateAge(dob);
      return age < 18 ? { spouseUnder18: true } : null;
    };
  }

  private calculateAge(dob: string | Date): number {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  isIdRequired(): boolean {
    const dob = this.memberForm.get('dateOfBirth')?.value;
    return dob ? this.calculateAge(dob) >= 14 : false;
  }

  isInvalid(name: string): boolean {
    const c = this.memberForm.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  private idNumberUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return this.householdService.checkIdNumberExists(control.value).pipe(
        map(exists => exists ? { idNumberExists: true } : null),
        catchError(() => of(null))
      );
    };
  }

  private getApartmentId(): string | null {
    return this.auth.user()?.apartment_id ?? null;
  }

  loadMembers() {
    const id = this.getApartmentId();
    if (!id) {
      this.isLoading.set(false);
      this.loadError.set('Không tìm thấy apartmentId trong phiên đăng nhập.');
      return;
    }

    this.isLoading.set(true);
    this.householdService.getMembersByApartment(id, 'Đang cư trú').subscribe({
      next: (data) => {
        this.members.set(data);
        this.isLoading.set(false);
        this.loadError.set(null);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set('Không thể tải danh sách hộ khẩu. Vui lòng thử lại.');
        console.error('Lỗi tải hộ khẩu:', err);
      }
    });
  }

  onSubmit(): void {
    this.memberForm.markAllAsTouched();
    if (this.memberForm.invalid || this.memberForm.pending) return;

    const apartmentId = this.getApartmentId();
    if (!apartmentId) return;

    this.isSubmitting.set(true);

    const v = this.memberForm.value;
    const dto: ApartmentMemberCreateDto = {
      apartmentId,
      name: v.name,
      familyRole: v.familyRole,
      dateOfBirth: v.dateOfBirth,
      gender: v.gender,
      idNumber: v.idNumber || null,
      phoneNumber: v.phoneNumber || null,
      nationality: v.nationality,
      isOwner: false,
      status: 'Đang cư trú',
      faceImageUrl: null,
      info: null
    };

    this.householdService.addHouseholdMember(dto, this.selectedFile ?? undefined)
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitSuccess.set('Thêm thành viên thành công');
          this.submitError.set(null);

          setTimeout(() => {
            this.submitSuccess.set(null);
          }, 3000);

          this.memberForm.reset({ nationality: 'Việt Nam' });
          this.selectedFile = null;
          this.loadMembers();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.submitError.set('Thêm thành viên thất bại');
        }
      });
  }
}
