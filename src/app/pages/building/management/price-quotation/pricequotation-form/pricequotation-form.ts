import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { 
  PriceQuotationService, 
  PriceQuotationCreateDto, 
  BuildingDto, 
  ECalculationMethod, 
  CalculationMethodOption,
  TieredPrice
} from '../../../../../services/management/price-quotation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-price-quotation-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
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
    this.calcMethods = this.quotationService.getCalculationMethods();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadBuildings();
    this.checkEditMode();

    this.form.get('calculationMethod')?.valueChanges.subscribe(value => {
      this.onCalcMethodChange(value);
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      buildingId: ['', Validators.required],
      feeType: ['', Validators.required],
      calculationMethod: [null, Validators.required],
      unitPrice: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]], 
      unit: [''],
      tiers: this.fb.array([]) 
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
    this.tiers.push(this.createTierGroup());
  }

  removeTier(index: number): void {
    this.tiers.removeAt(index);
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
          unit: data.unit
        });

        if (data.calculationMethod === ECalculationMethod.TIERED && data.note) {
          try {
            const tiersData: TieredPrice[] = JSON.parse(data.note);
            this.tiers.clear();
            tiersData.forEach(tier => {
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

  onCalcMethodChange(method: ECalculationMethod): void {
    const unitPriceControl = this.form.get('unitPrice');

    if (method === ECalculationMethod.TIERED) {
      unitPriceControl?.disable();
      if (this.tiers.length === 0) {
        this.addTier();
      }
    } else {
      unitPriceControl?.enable(); 
      this.tiers.clear(); 
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Vui lòng kiểm tra lại các trường bắt buộc', 'Đóng', { duration: 3000 });
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
      dto.note = JSON.stringify(formValue.tiers); 
      dto.unitPrice = formValue.tiers.length > 0 ? formValue.tiers[0].unitPrice : 0;
    } else {
      dto.unitPrice = formValue.unitPrice; 
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
        this.snackBar.open(err.error?.message || 'Lỗi: Thao tác thất bại', 'Đóng', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/manage-quotation']);
  }
}