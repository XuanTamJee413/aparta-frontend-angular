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

function contractDatesValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;

  if (!start || !end) {
    return null;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (endDate <= startDate) {
    return { endBeforeOrEqualStart: true };
  }

  return null;
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
    this.contractForm = this.fb.group(
      {
        apartmentId: [null, [Validators.required]],
        startDate: ['', [Validators.required, futureDateValidator()]],
        endDate: ['', [Validators.required]],

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
      },
      {
        validators: [contractDatesValidator]
      }
    );
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

    const formData = this.contractForm.value as ContractCreateDto;

    this.contractService.createContract(formData)
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
          this.submitError.set(
            err?.error?.message ||
            err?.error?.Message ||
            'Đã xảy ra lỗi trong quá trình tạo hợp đồng.'
          );
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
