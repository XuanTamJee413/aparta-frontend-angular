import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AsyncValidatorFn,
  ValidationErrors,
  AbstractControl
} from '@angular/forms';
import { ApartmentMemberCreateDto, ApartmentMemberDto, HouseholdService } from '../../../../services/resident/household.service';
import { AuthService } from '../../../../services/auth.service';
import { of, map, catchError } from 'rxjs';

@Component({
  selector: 'app-register-household',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-household.component.html',
  styleUrls: ['./register-household.component.css']
})
export class RegisterHousehold implements OnInit {
  private fb = inject(FormBuilder);
  private householdService = inject(HouseholdService);
  private auth = inject(AuthService);
  selectedFile: File | null = null;
  memberForm!: FormGroup;
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal<string | null>(null);
  members = signal<ApartmentMemberDto[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  confirmingDeleteId = signal<string | null>(null);

   onFileSelected(event: Event): void {
   const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.memberForm.patchValue({ faceImage: this.selectedFile });
    } else {
      this.selectedFile = null;
      this.memberForm.patchValue({ faceImage: null });
    }
    this.memberForm.get('faceImage')?.markAsTouched();
  }

  private getApartmentId(): string | null {
    const payload = this.auth.user();
    const id = payload?.apartment_id;
    return id ? String(id) : null;
  }

  ngOnInit(): void {
    this.memberForm = this.fb.group({
      name: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[\p{L}\s]+$/u)
      ]
    ],
      familyRole: [null, Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: [null],
      idNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d+$/)],
        [this.idNumberUniqueValidator()]
      ],
      phoneNumber: [
        '',
        [Validators.pattern(/^\d*$/)]
      ],
      nationality: ['Việt Nam'],
      faceImage: [null, Validators.required]
    });

    this.memberForm.get('familyRole')!.valueChanges.subscribe(role => {
      const genderCtrl = this.memberForm.get('gender');
      if (role === 'Vợ' || role === 'Mẹ') genderCtrl?.setValue('Nữ');
      else if (role === 'Chồng' || role === 'Bố') genderCtrl?.setValue('Nam');
    });

    this.loadMembers();
  }

  private idNumberUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return of<ValidationErrors | null>(null);
      if (!/^\d+$/.test(value)) return of<ValidationErrors | null>(null);
      return this.householdService.checkIdNumberExists(value).pipe(
        map(exists => (exists ? { idNumberExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    const apartmentId = this.getApartmentId();
    if (!apartmentId) {
      this.isLoading.set(false);
      this.loadError.set('Không tìm thấy apartmentId trong phiên đăng nhập.');
      return;
    }

    this.householdService.getMembersByApartment(apartmentId).subscribe({
      next: (data) => { this.members.set(data); this.isLoading.set(false); },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set('Không thể tải danh sách hộ khẩu. Vui lòng thử lại.');
        console.error('Lỗi tải hộ khẩu:', err);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.memberForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

     onSubmit(): void {
    this.memberForm.markAllAsTouched();
    if (this.memberForm.invalid || this.memberForm.pending) return;

    const apartmentId = this.getApartmentId();
    if (!apartmentId) {
      this.submitError.set('Không tìm thấy apartmentId trong phiên đăng nhập.');
      this.submitSuccess.set(null);
      return;
    }
    if (!this.selectedFile) {
        this.submitError.set('Vui lòng chọn ảnh khuôn mặt.');
        return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(null);

    const v = this.memberForm.value;
    const createDto: ApartmentMemberCreateDto = {
      apartmentId,
      name: v.name!,
      familyRole: v.familyRole!,
      dateOfBirth: v.dateOfBirth || null,
      gender: v.gender || null,
      idNumber: v.idNumber!,
      phoneNumber: v.phoneNumber || null,
      nationality: v.nationality || 'Việt Nam',
      isOwner: v.familyRole === 'Chủ hộ' || false,
      status: 'Đang cư trú',
      faceImageUrl: null,
      info: null
    };

    this.householdService.addHouseholdMember(createDto, this.selectedFile).subscribe({
      next: (created) => {
        console.log('Thêm thành viên thành công:', created);
        this.isSubmitting.set(false);
        this.memberForm.reset({ nationality: 'Việt Nam', faceImage: null });
        this.selectedFile = null;
        const fileInput = document.getElementById('faceImage') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        this.submitError.set(null);
        this.submitSuccess.set('Thêm thành viên thành công.');
        this.loadMembers();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(null);

        let msg = 'Vui lòng kiểm tra lại thông tin.';

        if (err.status === 500) {
          if (err.error?.message?.includes('column does not allow nulls')) {
            msg = 'Lỗi máy chủ (500): Một trường bắt buộc đang thiếu giá trị.';
          } else {
            msg = 'Lỗi máy chủ (500). Có thể trùng CCCD/SĐT hoặc dữ liệu không hợp lệ.';
          }
        } else if (err.status === 400) {
          if (err.error?.errors) msg = (Object.values(err.error.errors) as string[][]).flat().join(' ');
          else if (typeof err.error?.title === 'string' && err.error.title.includes('JSON')) msg = 'Dữ liệu gửi lên không hợp lệ.';
          else if (err.error?.message) msg = err.error.message;
          else msg = 'Dữ liệu gửi lên không hợp lệ (400).';
        } else if (err.error?.message) msg = err.error.message;
        else if (err.message) msg = err.message;

        this.submitError.set(`Thêm thành viên thất bại. ${msg}`);
        console.error('Lỗi thêm thành viên:', err);
      }
    });
  }


}
