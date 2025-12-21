import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import {
  AvailableApartmentDto,
  CreateContractRequestDto,
  MemberInputDto,
  ContractManagementService
} from '../../../../../services/management/contract-management.service';

function endDateAfterStartValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return endDate > startDate ? null : { endBeforeStart: true };
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
      contractNumber: ['', [Validators.required, Validators.maxLength(50)]],
      contractType: ['Sale', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      members: this.fb.array([])
    }, { validators: endDateAfterStartValidator() });

    // Add một member mặc định
    this.addMember();
  }

  ngOnInit(): void {
    this.loadAvailableApartments();

    const initialType = this.contractForm.get('contractType')?.value;
    this.setDefaultDatesForType(initialType);
    this.normalizeRolesForType(initialType);

    this.contractForm.get('contractType')?.valueChanges.subscribe(type => {
      this.onContractTypeChange(type);
    });

    this.contractForm.get('startDate')?.valueChanges.subscribe(start => {
      this.onStartDateChange(start);
    });

    this.contractForm.get('apartmentId')?.valueChanges.subscribe(() => {
      this.generateContractNumber();
    });
  }

  get members(): FormArray {
    return this.contractForm.get('members') as FormArray;
  }

  createMemberForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      identityCard: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      isPrimaryRole: [false],
      isAppAccess: [true],
      isRepresentative: [false]
    });
  }

  addMember(): void {
    this.members.push(this.createMemberForm());
  }

  removeMember(index: number): void {
    if (this.members.length > 1) {
      this.members.removeAt(index);
    }
  }

  private getTodayIso(): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  private addDays(dateIso: string, days: number): string {
    const d = new Date(dateIso);
    d.setDate(d.getDate() + days);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  private getMaxDateIso(): string {
    return '9999-12-31';
  }

  private getTypeCode(type: string): string {
    return type === 'Sale' ? 'HDMB' : 'HDT';
  }

  private generateContractNumber(): void {
    const type = this.contractForm.get('contractType')?.value;
    const apartmentId = this.contractForm.get('apartmentId')?.value;
    if (!type || !apartmentId) {
      this.contractForm.patchValue({ contractNumber: '' }, { emitEvent: false });
      return;
    }

    const aptCode = this.availableApartments().find(a => a.apartmentId === apartmentId)?.code || apartmentId;

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const firstBlock = `${dd}${MM}${HH}${mm}${ss}`;
    const yearBlock = now.getFullYear();
    const typeCode = this.getTypeCode(type);

    const contractNumber = `${firstBlock}/${yearBlock}/${typeCode}/${aptCode}`;
    this.contractForm.patchValue({ contractNumber }, { emitEvent: false });
  }

  private setDefaultDatesForType(type: string): void {
    const today = this.getTodayIso();
    if (type === 'Sale') {
      this.contractForm.patchValue({
        startDate: today,
        endDate: this.getMaxDateIso()
      }, { emitEvent: false });
    } else {
      this.contractForm.patchValue({
        startDate: today,
        endDate: this.addDays(today, 1)
      }, { emitEvent: false });
    }

    this.contractForm.updateValueAndValidity({ emitEvent: false });
    this.generateContractNumber();
  }

  private onContractTypeChange(type: string): void {
    this.setDefaultDatesForType(type);
    this.generateContractNumber();
    this.normalizeRolesForType(type);
  }

  private onStartDateChange(start: string): void {
    const type = this.contractForm.get('contractType')?.value;
    if (type === 'Lease' && start) {
      const end = this.contractForm.get('endDate')?.value;
      if (!end || new Date(end) <= new Date(start)) {
        this.contractForm.patchValue({ endDate: this.addDays(start, 1) }, { emitEvent: false });
      }
    }
  }

  get primaryRoleLabel(): string {
    const type = this.contractForm.get('contractType')?.value;
    return type === 'Sale' ? 'Chủ sở hữu' : 'Người thuê';
  }

  private normalizeRolesForType(type: string): void {
    // When contract type changes, keep existing primary role assignments
    // No need to reset as isPrimaryRole is type-agnostic
  }

  onPrimaryRoleChange(index: number, checked: boolean): void {
    if (!checked) {
      this.members.at(index).patchValue({ isPrimaryRole: false, isRepresentative: false }, { emitEvent: false });
      return;
    }

    // Only one member can have primary role and be representative
    this.members.controls.forEach((ctrl, idx) => {
      ctrl.patchValue(
        { isPrimaryRole: idx === index, isRepresentative: idx === index },
        { emitEvent: false }
      );
    });
  }

  onRepresentativeChange(index: number, checked: boolean): void {
    if (!checked) {
      this.members.at(index).patchValue({ isRepresentative: false }, { emitEvent: false });
      return;
    }

    this.members.controls.forEach((ctrl, idx) => {
      ctrl.patchValue({ isRepresentative: idx === index }, { emitEvent: false });
    });
  }

  loadAvailableApartments(): void {
    this.apartmentsLoading.set(true);
    this.apartmentsError.set(null);

    this.contractService.getAvailableApartmentsForMyBuildings()
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
      this.submitError.set('Hiện không còn căn hộ trống để tạo hợp đồng (trong tòa nhà bạn quản lý).');
      return;
    }

    // Kiểm tra ít nhất một representative
    const hasRepresentative = this.members.value.some((m: MemberInputDto) => m.isRepresentative);
    if (!hasRepresentative) {
      this.submitError.set('Phải có ít nhất một thành viên là đại diện hợp đồng.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.contractForm.value;
    const contractType = raw.contractType;

    // Map isPrimaryRole to roleName based on contract type
    const mappedMembers = raw.members.map((m: any) => ({
      fullName: m.fullName,
      phoneNumber: m.phoneNumber,
      identityCard: m.identityCard,
      email: m.email,
      roleName: m.isPrimaryRole ? (contractType === 'Sale' ? 'owner' : 'tenant') : 'family_member',
      isAppAccess: m.isAppAccess,
      isRepresentative: m.isRepresentative
    }));

    const dto: CreateContractRequestDto = {
      apartmentId: raw.apartmentId,
      contractNumber: raw.contractNumber,
      contractType: contractType,
      startDate: raw.startDate,
      endDate: raw.endDate,
      members: mappedMembers
    };

    this.contractService.createContract(dto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          if (res.succeeded) {
            alert('Tạo hợp đồng thành công!');
            this.router.navigate(['/manager/manage-contract']);
          } else {
            this.submitError.set(res.message || 'Đã xảy ra lỗi khi tạo hợp đồng.');
          }
        },
        error: (err) => {
          console.error('Lỗi khi tạo hợp đồng', err);
          const backendMsg: string = err?.error?.message || err?.error?.Message || '';
          this.submitError.set(backendMsg || 'Đã xảy ra lỗi trong quá trình tạo hợp đồng.');
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
