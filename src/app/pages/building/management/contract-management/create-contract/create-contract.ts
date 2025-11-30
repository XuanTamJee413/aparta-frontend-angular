import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import {
  AvailableApartmentDto,
  ContractCreateDto,
  ContractManagementService
} from '../../../../../services/management/contract-management.service';

function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const selected = new Date(value);
    const today = new Date();

    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selected <= today) {
      return { notFutureDate: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-create-contract',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css']
})
export class CreateContract implements OnInit {

  contractForm: FormGroup;

  availableApartments = signal<AvailableApartmentDto[]>([]);
  apartmentsLoading = signal(true);
  apartmentsError = signal<string | null>(null);

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private contractService: ContractManagementService,
    private router: Router,
    private location: Location
  ) {
    this.contractForm = this.fb.group({
      apartmentId: [null, [Validators.required]],
      startDate: ['', [Validators.required, futureDateValidator()]],


      ownerName: ['', [Validators.required, Validators.maxLength(100)]],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerPhoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10,11}$')]
      ],
      ownerIdNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern('^[0-9]+$')
        ]
      ],
      ownerGender: ['Nam', [Validators.required]],
      ownerDateOfBirth: ['', [Validators.required]],
      ownerNationality: ['Việt Nam', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadAvailableApartments();
  }

  loadAvailableApartments(): void {
    this.apartmentsLoading.set(true);
    this.apartmentsError.set(null);

    this.contractService.getAvailableApartments()
      .pipe(finalize(() => this.apartmentsLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.availableApartments.set(response.data || []);
          } else {
            this.apartmentsError.set(response.message || 'Không thể tải danh sách căn hộ.');
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách căn hộ', err);
          this.apartmentsError.set('Không thể tải danh sách căn hộ. Vui lòng thử lại.');
        }
      });
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();
      return;
    }

    if (!this.availableApartments().length) {
      this.submitError.set('Hiện không còn căn hộ trống để tạo hợp đồng.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.contractForm.value;

    const dto: ContractCreateDto = {
      apartmentId: raw.apartmentId,
      startDate: raw.startDate,
      endDate: null,
      image: null,

      ownerName: raw.ownerName,
      ownerEmail: raw.ownerEmail,
      ownerPhoneNumber: raw.ownerPhoneNumber,
      ownerIdNumber: raw.ownerIdNumber,
      ownerGender: raw.ownerGender,
      ownerDateOfBirth: raw.ownerDateOfBirth,
      ownerNationality: raw.ownerNationality
    };

    this.contractService.createContract(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res: any) => {
          let succeeded = true;
          let message: string | undefined;

          if (res && typeof res === 'object' && 'succeeded' in res) {
            succeeded = !!res.succeeded;
            message = res.message;
          }

          if (succeeded) {
            alert('Tạo hợp đồng thành công!');
            this.router.navigate(['/manager/manage-contract']);
          } else {
            this.submitError.set(message || 'Đã xảy ra lỗi khi tạo hợp đồng.');
          }
        },
        error: (err) => {
          console.error('Lỗi khi tạo hợp đồng', err);

          const backendMsg: string =
            err?.error?.message ||
            err?.error?.Message ||
            '';

          if (backendMsg && (backendMsg.includes('CMND') || backendMsg.includes('CCCD'))) {
            const cccdControl = this.contractForm.get('ownerIdNumber');
            if (cccdControl) {
              const currentErrors = cccdControl.errors || {};
              currentErrors['duplicateIdNumber'] = true;
              cccdControl.setErrors(currentErrors);
              cccdControl.markAsTouched();
            }

            this.submitError.set(null);
          } else {
            this.submitError.set(
              backendMsg || 'Đã xảy ra lỗi trong quá trình tạo hợp đồng.'
            );
          }
        }
      });
  }

  onCancel(): void {
    this.location.back();
  }

  isInvalid(controlName: string): boolean {
    const control = this.contractForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
