import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip'; // Cần thiết cho HTML
import {
  PriceQuotationService,
  PriceQuotationCreateDto,
  BuildingDto,
  ECalculationMethod,
  CalculationMethodOption,
  TieredPrice
} from '../../../../../services/management/price-quotation.service';
import { Observable } from 'rxjs';

// ====================================================================
// 1. CUSTOM VALIDATOR CHO BẬC THANG (TieredPriceValidator)
//    - Chỉ kiểm tra tính liên tục và phạm vi, KHÔNG DISABLE.
// ====================================================================
export const TieredPriceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const tiers = control as FormArray;
  if (!tiers || tiers.length === 0) {
    return null;
  }

  const controls = tiers.controls;
  let hasError = false;

  for (let i = 0; i < controls.length; i++) {
    const currentGroup = controls[i] as FormGroup;
    const fromValueControl = currentGroup.get('fromValue')!;
    const toValueControl = currentGroup.get('toValue')!;

    // Chuyển đổi giá trị input thành số
    const fromValue = Number(fromValueControl.value);
    const toValueRaw = toValueControl.value;
    const toValue = toValueRaw === null || toValueRaw === '' ? null : Number(toValueRaw);

    fromValueControl.setErrors(null);
    toValueControl.setErrors(null);

    // 1. Kiểm tra toValue > fromValue (Lỗi Phạm vi nội bộ: Số sau phải lớn hơn số trước)
    if (toValue !== null && toValue !== undefined && toValue <= fromValue) {
      toValueControl.setErrors({ 'invalidRange': true });
      hasError = true;
    }

    // 2. Kiểm tra tính liên tục với bậc trước đó (Chồng chéo)
    if (i > 0) {
      const prevGroup = controls[i - 1] as FormGroup;
      const prevToValue = Number(prevGroup.get('toValue')?.value);

      // Số 'Từ' của bậc hiện tại phải lớn hơn số 'Đến' của bậc trước
      if (!isNaN(prevToValue) && fromValue !== null && fromValue !== undefined && fromValue <= prevToValue) {
        fromValueControl.setErrors({ 'discontinuity': true, 'requiredMin': prevToValue + 1 });
        hasError = true;
      }
    }

    // 3. Bậc cuối cùng phải có toValue là null (empty)
    if (i === controls.length - 1 && toValue !== null && toValue !== undefined) {
      toValueControl.setErrors({ 'lastTierMustBeInfinite': true });
      hasError = true;
    }
  }

  return hasError ? { 'invalidTierStructure': true } : null;
};


// ====================================================================
// 2. COMPONENT LOGIC
// ====================================================================

@Component({
  selector: 'app-price-quotation-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './pricequotation-form.html',
  styleUrls: ['./pricequotation-form.css']
})
export class PriceQuotationFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private quotationService = inject(PriceQuotationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  buildings: BuildingDto[] = [];
  calcMethods: CalculationMethodOption[] = [];

  isEditMode = false;
  editId: string | null = null;
  isLoading = false;
  isSaving = false;

  ECalcMethod = ECalculationMethod;

  constructor() {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadBuildings();
    this.checkEditMode();

    this.loadCalculationMethods();

    this.form.get('calculationMethod')?.valueChanges.subscribe(value => {
      this.onCalcMethodChange(value);
    });

    // Kích hoạt validation cho FormArray khi các trường con thay đổi
    this.tiers.valueChanges.subscribe(() => {
      this.tiers.updateValueAndValidity({ emitEvent: false });
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      buildingId: ['', Validators.required],
      feeType: ['', Validators.required],
      calculationMethod: [null, Validators.required],
      unitPrice: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]],
      unit: [''],
      noteText: [''], // THÊM TRƯỜNG NOTE
      // ÁP DỤNG CUSTOM VALIDATOR CHO MẢNG TIERS
      tiers: this.fb.array([], { validators: TieredPriceValidator })
    });
  }

  get tiers(): FormArray {
    return this.form.get('tiers') as FormArray;
  }

  createTierGroup(data?: TieredPrice): FormGroup {
    return this.fb.group({
      fromValue: [data?.fromValue ?? 0, Validators.required],
      toValue: [data?.toValue ?? null], // null = vô cùng
      unitPrice: [data?.unitPrice ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  addTier(): void {
    // Thêm bậc mới luôn (không cần kiểm tra disable)
    this.tiers.push(this.createTierGroup());
    this.tiers.updateValueAndValidity();
  }

  removeTier(index: number): void {
    this.tiers.removeAt(index);
    this.tiers.updateValueAndValidity();
  }

  checkEditMode(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.isEditMode = true;
      this.loadQuotationData(this.editId);
    }
  }

  loadQuotationData(id: string): void {
    this.isLoading = true;
    this.quotationService.getPriceQuotationById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          buildingId: data.buildingId,
          feeType: data.feeType,
          calculationMethod: data.calculationMethod,
          unitPrice: data.unitPrice,
          unit: data.unit,
          // Patch noteText
          noteText: data.calculationMethod !== ECalculationMethod.TIERED ? data.note : ''
        });

        if (data.calculationMethod === ECalculationMethod.TIERED && data.note) {
          try {
            const tiersData: TieredPrice[] = JSON.parse(data.note);
            this.tiers.clear();
            tiersData.forEach(tier => {
              // Không cần disable/enable khi load data
              this.tiers.push(this.createTierGroup(tier));
            });
          } catch (e) {
            console.error("Lỗi parse JSON TIERED:", e);
            this.snackBar.open('Lỗi: Định dạng dữ liệu bậc thang không hợp lệ.', 'Đóng', { duration: 3000 });
          }
        }

        this.onCalcMethodChange(data.calculationMethod);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Không thể tải dữ liệu đơn giá', 'Đóng', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/manager/manage-quotation']);
      }
    });
  }

  loadBuildings(): void {
    this.quotationService.getBuildings().subscribe({
      next: (data) => {
        this.buildings = data;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Không thể tải danh sách tòa nhà', 'Đóng', { duration: 3000 });
      }
    });
  }

  loadCalculationMethods(): void {
    this.quotationService.getCalculationMethods().subscribe({
      next: (data) => {
        this.calcMethods = data;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Không thể tải danh sách phương thức tính', 'Đóng', { duration: 3000 });
      }
    });
  }


  onCalcMethodChange(method: ECalculationMethod): void {
    const unitPriceControl = this.form.get('unitPrice');
    const noteTextControl = this.form.get('noteText'); // Thêm noteTextControl

    if (method === ECalculationMethod.TIERED) {
      unitPriceControl?.disable();
      noteTextControl?.disable(); // Disable noteText
      if (this.tiers.length === 0) {
        this.addTier();
      }
    } else {
      unitPriceControl?.enable();
      noteTextControl?.enable(); // Enable noteText
      this.tiers.clear();
    }
    this.form.updateValueAndValidity();
  }

  onSubmit(): void {
    // Kích hoạt validation cuối cùng cho FormArray
    this.tiers.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Vui lòng kiểm tra lại các trường bắt buộc và cấu trúc bậc thang', 'Đóng', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.form.getRawValue();

    const dto: PriceQuotationCreateDto = {
      buildingId: formValue.buildingId,
      feeType: formValue.feeType,
      calculationMethod: formValue.calculationMethod,
      unitPrice: 0,
      unit: formValue.unit,
      note: null
    };

    if (formValue.calculationMethod === ECalculationMethod.TIERED) {
      // Chuẩn hóa dữ liệu TIERED
      const rawTiers = formValue.tiers.map((tier: any) => ({
        fromValue: tier.fromValue,
        // Xử lý giá trị rỗng từ input thành null cho Backend
        toValue: tier.toValue === '' || tier.toValue === null ? null : Number(tier.toValue),
        unitPrice: tier.unitPrice
      }));

      dto.note = JSON.stringify(rawTiers);
      // Sử dụng unitPrice của bậc đầu tiên cho trường unitPrice chính của DTO
      dto.unitPrice = rawTiers.length > 0 ? rawTiers[0].unitPrice : 0;
    } else {
      dto.unitPrice = formValue.unitPrice;
      dto.note = formValue.noteText || null; // Gán noteText cho trường note
    }

    const saveObservable: Observable<any> = this.isEditMode
      ? this.quotationService.updatePriceQuotation(this.editId!, dto)
      : this.quotationService.createPriceQuotation(dto);

    saveObservable.subscribe({
      next: (res) => {
        this.isSaving = false;
        const successMsg = this.isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công';
        this.snackBar.open(successMsg, 'Đóng', { duration: 3000 });
        this.router.navigate(['/manager/manage-quotation']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        // Bắt lỗi nghiệp vụ từ Backend (InvalidOperationException)
        const errorMessage = err.error?.message || err.error?.Message || 'Lỗi: Thao tác thất bại';
        this.snackBar.open(errorMessage, 'Đóng', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/manage-quotation']);
  }
}