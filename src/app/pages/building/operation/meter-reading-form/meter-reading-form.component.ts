import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MeterReadingService } from '../../../../services/operation/meter-reading.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import {
  ApartmentDto,
  MeterReadingServiceDto,
  MeterReadingCreateDto,
  MeterReadingUpdateDto,
  MeterReadingDto,
  MeterReadingCheckResponse
} from '../../../../models/meter-reading.model';

@Component({
  selector: 'app-meter-reading-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  templateUrl: './meter-reading-form.component.html',
  styleUrls: ['./meter-reading-form.component.css']
})
export class MeterReadingFormComponent implements OnInit {
  buildings: BuildingDto[] = [];
  selectedBuildingId: string = '';
  apartments: ApartmentDto[] = [];
  filteredApartments: ApartmentDto[] = [];
  searchText: string = '';
  selectedApartmentId: string = '';
  selectedApartment: ApartmentDto | null = null;
  services: string[] = [];
  existingReadings: Map<string, MeterReadingDto> = new Map();
  latestReadings: Map<string, MeterReadingDto> = new Map();
  loadingBuildings = false;
  loadingApartments = false;
  loadingServices = false;
  checkingExisting = false;
  saving = false;
  isUpdateMode = false;
  hasAnyExistingReadings = false;
  meterReadingForm: FormGroup;

  // Pagination
  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private meterReadingService: MeterReadingService,
    private buildingService: BuildingService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.meterReadingForm = this.fb.group({
      readings: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadBuildings();
  }

  // Lấy ngày hiện tại (format: yyyy-MM-dd)
  getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Lấy billing period hiện tại (yyyy-MM)
  getCurrentBillingPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Tải danh sách tòa nhà
  loadBuildings(): void {
    this.loadingBuildings = true;
    this.buildingService.getAllBuildings({ take: 100 }).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.items) {
          this.buildings = response.data.items.filter(b => b.isActive);
          if (this.buildings.length > 0) {
            this.selectedBuildingId = this.buildings[0].buildingId;
            this.loadApartments();
          }
        }
        this.loadingBuildings = false;
      },
      error: (error) => {
        this.showError('Không thể tải danh sách tòa nhà');
        this.loadingBuildings = false;
      }
    });
  }

  // Xử lý khi thay đổi tòa nhà
  onBuildingChange(): void {
    if (!this.selectedBuildingId) {
      this.apartments = [];
      this.selectedApartmentId = '';
      this.resetForm();
      return;
    }

    this.loadApartments();
  }

  // Tải danh sách căn hộ đã thuê
  loadApartments(): void {
    this.loadingApartments = true;
    this.apartments = [];
    this.filteredApartments = [];
    this.searchText = '';
    this.pageIndex = 0;
    this.selectedApartmentId = '';
    this.selectedApartment = null;
    this.resetForm();

    this.meterReadingService.getApartmentsForBuilding(this.selectedBuildingId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.apartments = response.data;
          this.applyFilter();
          if (this.filteredApartments.length > 0) {
            this.onApartmentClick(this.filteredApartments[0]);
          }
        } else {
          this.showError(response.message || 'Không thể tải danh sách căn hộ');
        }
        this.loadingApartments = false;
      },
      error: (error) => {
        this.showError('Không thể tải danh sách căn hộ');
        this.loadingApartments = false;
      }
    });
  }

  // Lọc căn hộ theo tên
  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredApartments = [...this.apartments];
    } else {
      const searchLower = this.searchText.toLowerCase().trim();
      this.filteredApartments = this.apartments.filter(apt =>
        apt.code.toLowerCase().includes(searchLower)
      );
    }
    this.totalItems = this.filteredApartments.length;
    this.pageIndex = 0;
  }

  // Xử lý khi thay đổi search text
  onSearchChange(): void {
    this.applyFilter();
    if (this.filteredApartments.length > 0 && !this.selectedApartmentId) {
      this.onApartmentClick(this.filteredApartments[0]);
    }
  }

  // Xử lý khi thay đổi trang
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Lấy danh sách căn hộ theo trang hiện tại
  getPaginatedApartments(): ApartmentDto[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredApartments.slice(startIndex, startIndex + this.pageSize);
  }

  // Xử lý khi click chọn căn hộ
  onApartmentClick(apartment: ApartmentDto): void {
    this.selectedApartmentId = apartment.apartmentId;
    this.selectedApartment = apartment;
    
    this.loadServices();
  }



  // Tải danh sách loại phí cho căn hộ
  loadServices(): void {
    if (!this.selectedApartmentId) return;

    this.loadingServices = true;
    this.services = [];
    const readingsArray = this.meterReadingForm.get('readings') as FormArray;
    readingsArray.clear();

    this.meterReadingService.getServicesForApartment(this.selectedApartmentId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.services = response.data;
          this.checkExistingReadings();
        } else {
          this.showError(response.message || 'Không thể tải danh sách loại phí');
        }
        this.loadingServices = false;
      },
      error: (error) => {
        this.showError('Không thể tải danh sách loại phí');
        this.loadingServices = false;
      }
    });
  }

  // Kiểm tra chỉ số hiện có trong tháng
  checkExistingReadings(): void {
    if (!this.selectedApartmentId || this.services.length === 0) {
      return;
    }

    this.checkingExisting = true;
    this.existingReadings.clear();
    this.latestReadings.clear();
    this.hasAnyExistingReadings = false;

    const billingPeriod = this.getCurrentBillingPeriod();
    const checkPromises = this.services.map(service => 
      this.meterReadingService.checkMeterReadingExists(
        this.selectedApartmentId,
        service,
        billingPeriod
      ).toPromise()
    );

    Promise.all(checkPromises).then(results => {
      results.forEach((response, index) => {
        if (response?.succeeded && response.data) {
          const service = this.services[index];
          const checkData = response.data;
          
          if (checkData.exists && checkData.meterReading) {
            this.existingReadings.set(service, checkData.meterReading);
            this.hasAnyExistingReadings = true;
          }
          
          if (checkData.latestReading) {
            this.latestReadings.set(service, checkData.latestReading);
          }
        }
      });

      this.buildDynamicForm();
      this.isUpdateMode = this.hasAnyExistingReadings;
      this.checkingExisting = false;
    }).catch(error => {
      this.buildDynamicForm();
      this.isUpdateMode = false;
      this.checkingExisting = false;
    });
  }

  // Tạo form động cho các loại phí
  buildDynamicForm(): void {
    const readingsArray = this.meterReadingForm.get('readings') as FormArray;
    readingsArray.clear();

    this.services.forEach(service => {
      const existingReading = this.existingReadings.get(service);
      
      readingsArray.push(
        this.fb.group({
          feeType: [service, Validators.required],
          readingValue: [
            existingReading?.readingValue || null, 
            [Validators.required, Validators.min(0)]
          ],
          readingId: [existingReading?.readingId || existingReading?.meterReadingId || null]
        })
      );
    });
  }

  // Lấy chỉ số trước đó của loại phí
  getLatestReadingValue(feeType: string): number | null {
    const latestReading = this.latestReadings.get(feeType);
    return latestReading?.readingValue || null;
  }

  get readingsFormArray(): FormArray {
    return this.meterReadingForm.get('readings') as FormArray;
  }

  getReadingFormGroup(index: number): FormGroup {
    return this.readingsFormArray.at(index) as FormGroup;
  }

  // Xử lý submit form
  onSubmit(): void {
    if (this.meterReadingForm.invalid || !this.selectedApartmentId) {
      this.showError('Vui lòng điền đầy đủ thông tin và kiểm tra lại các giá trị');
      return;
    }

    this.saving = true;
    const formValue = this.meterReadingForm.value;
    const readingDate = this.getCurrentDate();

    if (this.isUpdateMode && this.hasAnyExistingReadings) {
      this.updateAllReadings(formValue.readings);
    } else {
      const readings: MeterReadingCreateDto[] = [];
      
      this.readingsFormArray.controls.forEach((control, index) => {
        const readingGroup = control as FormGroup;
        const feeType = readingGroup.get('feeType')?.value || this.services[index];
        const readingValue = readingGroup.get('readingValue')?.value;
        
        if (feeType && readingValue !== null && readingValue !== undefined) {
          readings.push({
            feeType: feeType,
            readingValue: Number(readingValue),
            readingDate: readingDate
          });
        }
      });

      this.meterReadingService.createMeterReadings(this.selectedApartmentId, readings).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.showSuccess('Lưu chỉ số thành công');
            setTimeout(() => {
              this.checkExistingReadings();
            }, 1000);
          } else {
            const message = response.message || '';
            if (message.includes('tồn tại') || message.includes('exists') || message.includes('SM34')) {
              this.showError('Đã có chỉ số trong tháng này. Vui lòng liên hệ admin để cập nhật hoặc chọn tháng khác.');
            } else {
              this.showError(response.message || 'Lưu chỉ số thất bại');
            }
          }
          this.saving = false;
        },
        error: (error) => {
          const errorMessage = error.error?.message || error.error?.Message || '';
          if (errorMessage.includes('tồn tại') || errorMessage.includes('exists') || errorMessage.includes('SM34')) {
            this.showError('Đã có chỉ số trong tháng này. Vui lòng liên hệ admin để cập nhật hoặc chọn tháng khác.');
          } else if (errorMessage.includes('too low') || errorMessage.includes('SM35')) {
            this.showError('Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + errorMessage);
          } else {
            this.showError(errorMessage || 'Lưu chỉ số thất bại');
          }
          this.saving = false;
        }
      });
    }
  }

  // Cập nhật tất cả chỉ số
  updateAllReadings(readings: any[]): void {
    const updatePromises: Promise<any>[] = [];
    let successCount = 0;
    let errorCount = 0;
    let lastError: string = '';

    readings.forEach((reading: any, index: number) => {
      const readingGroup = this.readingsFormArray.at(index) as FormGroup;
      const feeType = readingGroup.get('feeType')?.value || reading.feeType || this.services[index];
      const rawReadingValue = readingGroup.get('readingValue')?.value || reading.readingValue;
      const readingId = readingGroup.get('readingId')?.value || reading.readingId;

      if (readingId) {
        const numericValue = typeof rawReadingValue === 'string' ? parseFloat(rawReadingValue) : Number(rawReadingValue);
        
        if (isNaN(numericValue)) {
          errorCount++;
          lastError = `Giá trị chỉ số không hợp lệ cho ${feeType}`;
          return;
        }
        
        const updateDto: MeterReadingUpdateDto = {
          readingValue: numericValue
        };

        const promise = this.meterReadingService.updateMeterReading(readingId, updateDto).toPromise();
        updatePromises.push(
          promise.then((response) => {
            if (response?.succeeded) {
              successCount++;
            } else {
              errorCount++;
              lastError = response?.message || 'Lỗi không xác định';
            }
          }).catch((error) => {
            errorCount++;
            const errorMessage = error.error?.message || error.error?.Message || '';
            if (errorMessage.includes('too low') || errorMessage.includes('SM35')) {
              lastError = 'Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + errorMessage;
            } else if (errorMessage.includes('locked') || errorMessage.includes('SM30')) {
              lastError = 'Chỉ số này đã bị khóa, không thể cập nhật. ' + errorMessage;
            } else {
              lastError = errorMessage || 'Lỗi cập nhật chỉ số';
            }
          })
        );
      } else {
        const readingDate = this.getCurrentDate();
        const numericValue = typeof rawReadingValue === 'string' ? parseFloat(rawReadingValue) : Number(rawReadingValue);
        
        if (isNaN(numericValue)) {
          errorCount++;
          lastError = `Giá trị chỉ số không hợp lệ cho ${feeType}`;
          return;
        }
        
        const createDto: MeterReadingCreateDto[] = [{
          feeType: feeType,
          readingValue: numericValue,
          readingDate: readingDate
        }];

        const promise = this.meterReadingService.createMeterReadings(this.selectedApartmentId, createDto).toPromise();
        updatePromises.push(
          promise.then((response) => {
            if (response?.succeeded) {
              successCount++;
            } else {
              errorCount++;
              const message = response?.message || '';
              if (message.includes('tồn tại') || message.includes('exists') || message.includes('SM34')) {
                lastError = 'Đã có chỉ số trong tháng này. ' + message;
              } else if (message.includes('too low') || message.includes('SM35')) {
                lastError = 'Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + message;
              } else {
                lastError = message || 'Lỗi không xác định';
              }
            }
          }).catch((error) => {
            errorCount++;
            const errorMessage = error.error?.message || error.error?.Message || '';
            if (errorMessage.includes('tồn tại') || errorMessage.includes('exists') || errorMessage.includes('SM34')) {
              lastError = 'Đã có chỉ số trong tháng này. ' + errorMessage;
            } else if (errorMessage.includes('too low') || errorMessage.includes('SM35')) {
              lastError = 'Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + errorMessage;
            } else {
              lastError = errorMessage || 'Lỗi tạo chỉ số';
            }
          })
        );
      }
    });

    Promise.all(updatePromises).then(() => {
      if (errorCount === 0) {
        this.showSuccess(`Cập nhật thành công ${successCount} chỉ số`);
        setTimeout(() => {
          this.checkExistingReadings();
        }, 1000);
      } else {
        this.showError(`Cập nhật ${successCount} thành công, ${errorCount} thất bại. ${lastError}`);
        this.checkExistingReadings();
      }
      this.saving = false;
    }).catch(() => {
      this.showError('Lỗi cập nhật chỉ số');
      this.saving = false;
    });
  }


  // Reset form về trạng thái ban đầu
  resetForm(): void {
    const readingsArray = this.meterReadingForm.get('readings') as FormArray;
    readingsArray.clear();
    this.existingReadings.clear();
    this.latestReadings.clear();
    this.hasAnyExistingReadings = false;
    this.isUpdateMode = false;
  }

  // Hiển thị thông báo thành công
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Hiển thị thông báo lỗi
  showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
