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

  // --- Services ---
  private fb = inject(FormBuilder);
  private quotationService = inject(PriceQuotationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  // --- Dữ liệu ---
  form!: FormGroup;
  buildings: BuildingDto[] = [];
  calcMethods: CalculationMethodOption[] = [];

  // --- Trạng thái ---
  isEditMode = false;
  editId: string | null = null;
  isLoading = false;
  isSaving = false;
  
  // Enum để dùng trong HTML
  ECalcMethod = ECalculationMethod;

  constructor() {
    this.calcMethods = this.quotationService.getCalculationMethods();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadBuildings();
    this.checkEditMode();

    // Theo dõi sự thay đổi của 'calculationMethod'
    this.form.get('calculationMethod')?.valueChanges.subscribe(value => {
      this.onCalcMethodChange(value);
    });
  }

  /** Khởi tạo Form (Reactive) */
  initForm(): void {
    this.form = this.fb.group({
      buildingId: ['', Validators.required],
      feeType: ['', Validators.required],
      calculationMethod: [null, Validators.required],
      // Trường này sẽ bị disable/enable
      unitPrice: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]], 
      unit: [''],
      // FormArray cho TIERED (lũy tiến)
      tiers: this.fb.array([]) 
    });
  }

  /** Lấy FormArray 'tiers' (để dùng trong HTML) */
  get tiers(): FormArray {
    return this.form.get('tiers') as FormArray;
  }

  /** Tạo một FormGroup cho 1 bậc giá */
  createTierGroup(data?: TieredPrice): FormGroup {
    return this.fb.group({
      fromValue: [data?.fromValue ?? 0, Validators.required],
      toValue: [data?.toValue ?? null], // null = vô cùng
      unitPrice: [data?.unitPrice ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  /** Thêm 1 bậc giá mới */
  addTier(): void {
    this.tiers.push(this.createTierGroup());
  }

  /** Xóa 1 bậc giá */
  removeTier(index: number): void {
    this.tiers.removeAt(index);
  }

  /** Kiểm tra xem có đang ở chế độ Sửa không */
  checkEditMode(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.isEditMode = true;
      this.loadQuotationData(this.editId);
    }
  }

  /** Tải dữ liệu (nếu ở chế độ Sửa) */
  loadQuotationData(id: string): void {
    this.isLoading = true;
    this.quotationService.getPriceQuotationById(id).subscribe({
      next: (data) => {
        // Patch các giá trị cơ bản
        this.form.patchValue({
          buildingId: data.buildingId,
          feeType: data.feeType,
          calculationMethod: data.calculationMethod,
          unitPrice: data.unitPrice,
          unit: data.unit
        });

        // Nếu là TIERED, xử lý JSON trong 'note'
        if (data.calculationMethod === ECalculationMethod.TIERED && data.note) {
          try {
            const tiersData: TieredPrice[] = JSON.parse(data.note);
            // Xóa mảng cũ
            this.tiers.clear();
            // Thêm các bậc giá vào FormArray
            tiersData.forEach(tier => {
              this.tiers.push(this.createTierGroup(tier));
            });
          } catch (e) {
            console.error("Lỗi parse JSON TIERED:", e);
            this.snackBar.open('Lỗi: Định dạng dữ liệu bậc thang không hợp lệ.', 'Đóng', { duration: 3000 });
          }
        }
        
        this.onCalcMethodChange(data.calculationMethod); // Cập nhật UI
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

  /** Tải danh sách Tòa nhà (cho combobox) */
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

  /** Logic động: Ẩn/hiện trường dựa trên Phương thức tính */
  onCalcMethodChange(method: ECalculationMethod): void {
    const unitPriceControl = this.form.get('unitPrice');

    if (method === ECalculationMethod.TIERED) {
      // Nếu là Lũy tiến:
      unitPriceControl?.disable(); // Tắt ô Đơn giá
      // Nếu mảng rỗng, thêm 1 bậc mặc định
      if (this.tiers.length === 0) {
        this.addTier();
      }
    } else {
      // Nếu là các loại khác:
      unitPriceControl?.enable(); // Bật ô Đơn giá
      this.tiers.clear(); // Xóa hết các bậc giá (nếu có)
    }
  }

  /** Xử lý Submit Form (Thêm/Sửa) */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Vui lòng kiểm tra lại các trường bắt buộc', 'Đóng', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.form.getRawValue(); // Lấy cả giá trị bị disable

    // Chuẩn bị DTO
    const dto: PriceQuotationCreateDto = {
      buildingId: formValue.buildingId,
      feeType: formValue.feeType,
      calculationMethod: formValue.calculationMethod,
      unitPrice: 0, // Giá trị mặc định
      unit: formValue.unit,
      note: null
    };

    // Xử lý logic TIERED vs Giá cố định
    if (formValue.calculationMethod === ECalculationMethod.TIERED) {
      dto.note = JSON.stringify(formValue.tiers); // Chuyển mảng bậc giá thành JSON
      // Lưu giá bậc đầu tiên vào unitPrice (theo yêu cầu của bạn)
      dto.unitPrice = formValue.tiers.length > 0 ? formValue.tiers[0].unitPrice : 0;
    } else {
      dto.unitPrice = formValue.unitPrice; // Lấy giá từ ô Đơn giá
    }

    // Quyết định gọi API Thêm mới hay Cập nhật
    const saveObservable: Observable<any> = this.isEditMode
      ? this.quotationService.updatePriceQuotation(this.editId!, dto)
      : this.quotationService.createPriceQuotation(dto);

    saveObservable.subscribe({
      next: (res) => {
        this.isSaving = false;
        const successMsg = this.isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công';
        this.snackBar.open(successMsg, 'Đóng', { duration: 3000 });
        this.router.navigate(['/manager/manage-quotation']); // Quay về trang danh sách
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.snackBar.open(err.error?.message || 'Lỗi: Thao tác thất bại', 'Đóng', { duration: 3000 });
      }
    });
  }

  /** Quay về trang danh sách */
  goBack(): void {
    this.router.navigate(['/manager/manage-quotation']);
  }
}