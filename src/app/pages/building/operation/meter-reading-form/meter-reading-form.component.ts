import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

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
import { ProfileService } from '../../../../services/profile.service';
import { AuthService } from '../../../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-meter-reading-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './meter-reading-form.component.html',
  styleUrls: ['./meter-reading-form.component.css']
})
export class MeterReadingFormComponent implements OnInit {
  buildings: BuildingDto[] = [];
  selectedBuildingId: string = '';
  selectedBuilding: BuildingDto | null = null;
  apartments: ApartmentDto[] = [];
  filteredApartments: ApartmentDto[] = [];
  searchText: string = '';
  selectedApartmentId: string = '';
  selectedApartment: ApartmentDto | null = null;
  services: MeterReadingServiceDto[] = [];
  servicesByMethod: Map<string, MeterReadingServiceDto[]> = new Map();
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

  // Message hiển thị ngay dưới nút Lưu
  submitMessage: string = '';
  submitMessageType: 'success' | 'error' | '' = '';

  // Pagination
  pageSize = 6;
  pageIndex = 0;
  totalItems = 0;

  // Toast notification
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };
  private toastTimeout: any;

  constructor(
    private meterReadingService: MeterReadingService,
    private buildingService: BuildingService,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService
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
  // Lưu ý: billingPeriod = tháng trước vì ghi chỉ số cuối kỳ (tháng trước)
  getCurrentBillingPeriod(): string {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = previousMonth.getFullYear();
    const month = String(previousMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Tải danh sách tòa nhà
  loadBuildings(): void {
    this.loadingBuildings = true;
    
    // Kiểm tra role: tất cả role (trừ admin) chỉ thấy building được gán
    const user = this.authService.user();
    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';
    
    if (!isAdmin) {
      // Load buildings từ profile (assignedBuildings) cho tất cả role
      this.profileService.getProfile().subscribe({
        next: (response) => {
          if (response.succeeded && response.data?.currentAssignments) {
            const buildingIds = response.data.currentAssignments.map(a => a.buildingId);
            
            if (buildingIds.length === 0) {
              this.buildings = [];
              this.showError('Không có building nào được gán cho bạn');
              this.loadingBuildings = false;
              return;
            }

            // Load thông tin đầy đủ của từng building để lấy readingWindowStart và readingWindowEnd
            const buildingObservables = buildingIds.map(buildingId => 
              this.buildingService.getBuildingById(buildingId)
            );

            // Gọi song song tất cả requests
            forkJoin(buildingObservables).subscribe({
              next: (responses) => {
                this.buildings = responses
                  .filter(r => r.succeeded && r.data)
                  .map(r => r.data!)
                  .filter(b => b.isActive);
                
                if (this.buildings.length > 0) {
                  this.selectedBuildingId = this.buildings[0].buildingId;
                  this.selectedBuilding = this.buildings[0];
                  this.loadApartments();
                } else {
                  this.showError('Không có building nào được gán cho bạn');
                }
                this.loadingBuildings = false;
              },
              error: (error) => {
                // Fallback: dùng thông tin từ profile nếu không load được chi tiết
                if (response.succeeded && response.data?.currentAssignments) {
                  this.buildings = response.data.currentAssignments.map(assignment => ({
                    buildingId: assignment.buildingId,
                    name: assignment.buildingName,
                    buildingCode: assignment.buildingId,
                    projectId: '',
                    numApartments: 0,
                    numResidents: 0,
                    totalFloors: 0,
                    totalBasements: 0,
                    readingWindowStart: 1,
                    readingWindowEnd: 31,
                    isActive: true,
                    description: '',
                    createdAt: assignment.startDate,
                    updatedAt: assignment.startDate
                  } as BuildingDto));
                  
                  if (this.buildings.length > 0) {
                    this.selectedBuildingId = this.buildings[0].buildingId;
                    this.selectedBuilding = this.buildings[0];
                    this.loadApartments();
                  }
                }
                this.loadingBuildings = false;
              }
            });
          } else {
            this.buildings = [];
            this.showError('Không có building nào được gán cho bạn');
            this.loadingBuildings = false;
          }
        },
        error: (error) => {
          this.showError('Không thể tải danh sách tòa nhà');
          this.loadingBuildings = false;
        }
      });
    } else {
      // Admin: load tất cả buildings
      this.buildingService.getAllBuildings({ take: 100 }).subscribe({
        next: (response) => {
          if (response.succeeded && response.data?.items) {
            this.buildings = response.data.items.filter(b => b.isActive);
            if (this.buildings.length > 0) {
              this.selectedBuildingId = this.buildings[0].buildingId;
              this.selectedBuilding = this.buildings[0];
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
  }

  // Xử lý khi thay đổi tòa nhà
  onBuildingChange(): void {
    if (!this.selectedBuildingId) {
      this.apartments = [];
      this.selectedApartmentId = '';
      this.selectedBuilding = null;
      this.resetForm();
      return;
    }

    // Tìm building được chọn
    this.selectedBuilding = this.buildings.find(b => b.buildingId === this.selectedBuildingId) || null;
    this.loadApartments();
  }

  // Lấy thông tin ngày được phép ghi chỉ số
  getReadingWindowInfo(): string {
    if (!this.selectedBuilding) {
      return '';
    }

    const start = this.selectedBuilding.readingWindowStart;
    const end = this.selectedBuilding.readingWindowEnd;

    if (start === end) {
      return `Ngày ${start} hàng tháng`;
    } else if (end > start) {
      return `Từ ngày ${start} đến ngày ${end} hàng tháng`;
    } else {
      // Cross-month: ví dụ 31 -> 1
      return `Từ ngày ${start} đến ngày ${end} (tháng sau) hàng tháng`;
    }
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

  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getStartIndex(): number {
    return this.pageIndex * this.pageSize;
  }

  getEndIndex(): number {
    const end = (this.pageIndex + 1) * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  goToFirstPage(): void {
    this.pageIndex = 0;
  }

  goToPreviousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  goToNextPage(): void {
    if (this.pageIndex < this.getTotalPages() - 1) {
      this.pageIndex++;
    }
  }

  goToLastPage(): void {
    this.pageIndex = this.getTotalPages() - 1;
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
    this.servicesByMethod.clear();
    const readingsArray = this.meterReadingForm.get('readings') as FormArray;
    readingsArray.clear();

    this.meterReadingService.getServicesForApartment(this.selectedApartmentId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.services = response.data;
          // Nhóm services theo calculationMethod
          this.servicesByMethod.clear();
          this.services.forEach(service => {
            const method = service.calculationMethod || 'OTHER';
            if (!this.servicesByMethod.has(method)) {
              this.servicesByMethod.set(method, []);
            }
            this.servicesByMethod.get(method)!.push(service);
          });
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

  // Lấy danh sách methods
  getMethods(): string[] {
    return Array.from(this.servicesByMethod.keys());
  }

  // Lấy services theo method
  getServicesByMethod(method: string): MeterReadingServiceDto[] {
    return this.servicesByMethod.get(method) || [];
  }

  // Lấy tên hiển thị cho method
  getMethodDisplayName(method: string): string {
    const methodNames: { [key: string]: string } = {
      'PER_UNIT_METER': 'Theo chỉ số đồng hồ',
      'TIERED': 'Theo bậc thang',
      'OTHER': 'Khác'
    };
    return methodNames[method] || method;
  }

  // Lấy index của form control cho một service
  getFormControlIndex(service: MeterReadingServiceDto): number {
    const index = this.services.findIndex(s => s.feeType === service.feeType);
    if (index === -1) {
      console.warn(`Service ${service.feeType} not found in services array`);
    }
    return index;
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
        service.feeType,
        billingPeriod
      ).toPromise()
    );

    Promise.all(checkPromises).then(results => {
      results.forEach((response, index) => {
        if (response?.succeeded && response.data) {
          const service = this.services[index];
          const checkData = response.data;
          
          if (checkData.exists && checkData.meterReading) {
            this.existingReadings.set(service.feeType, checkData.meterReading);
            this.hasAnyExistingReadings = true;
          }
          
          if (checkData.latestReading) {
            this.latestReadings.set(service.feeType, checkData.latestReading);
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
      const existingReading = this.existingReadings.get(service.feeType);
      
      const formGroup = this.fb.group({
        feeType: [service.feeType, Validators.required],
        readingValue: [
          existingReading?.readingValue || null, 
          [Validators.required, Validators.min(0)]
        ],
        readingId: [existingReading?.readingId || existingReading?.meterReadingId || null]
      });
      
      readingsArray.push(formGroup);
      
      // Nếu có giá trị, mark form control as touched để form có thể submit
      if (existingReading?.readingValue) {
        formGroup.get('readingValue')?.markAsTouched();
      }
    });
    
    // Update form validity sau khi rebuild
    this.meterReadingForm.updateValueAndValidity();
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
        const feeType = readingGroup.get('feeType')?.value || this.services[index]?.feeType;
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
            this.submitMessage = 'Lưu chỉ số thành công';
            this.submitMessageType = 'success';
            setTimeout(() => {
              this.checkExistingReadings();
              // Clear message sau 3 giây
              setTimeout(() => {
                this.submitMessage = '';
                this.submitMessageType = '';
              }, 3000);
            }, 1000);
          } else {
            const message = response.message || '';
            if (message.includes('tồn tại') || message.includes('exists') || message.includes('SM34')) {
              this.submitMessage = 'Đã có chỉ số trong tháng trước. Vui lòng liên hệ admin để cập nhật hoặc chọn tháng khác.';
            } else {
              this.submitMessage = response.message || 'Lưu chỉ số thất bại';
            }
            this.submitMessageType = 'error';
          }
          this.saving = false;
        },
        error: (error) => {
          const errorMessage = error.error?.message || error.error?.Message || '';
          if (errorMessage.includes('tồn tại') || errorMessage.includes('exists') || errorMessage.includes('SM34')) {
            this.submitMessage = 'Đã có chỉ số trong tháng trước. Vui lòng liên hệ admin để cập nhật hoặc chọn tháng khác.';
          } else if (errorMessage.includes('too low') || errorMessage.includes('SM35')) {
            this.submitMessage = 'Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + errorMessage;
          } else {
            this.submitMessage = errorMessage || 'Lưu chỉ số thất bại';
          }
          this.submitMessageType = 'error';
          this.saving = false;
        }
      });
    }
  }

  /**
   * Cập nhật/tạo nhiều chỉ số đồng hồ cùng lúc cho một apartment
   * Xử lý song song các request và đếm kết quả thành công/thất bại
   */
  updateAllReadings(readings: any[]): void {
    const updatePromises: Promise<any>[] = [];
    let successCount = 0;
    let errorCount = 0;
    let lastError: string = '';

    // Duyệt qua từng chỉ số trong form
    readings.forEach((reading: any, index: number) => {
      const readingGroup = this.readingsFormArray.at(index) as FormGroup;
      const feeType = readingGroup.get('feeType')?.value || reading.feeType || this.services[index]?.feeType;
      const rawReadingValue = readingGroup.get('readingValue')?.value || reading.readingValue;
      const readingId = readingGroup.get('readingId')?.value || reading.readingId;

      // Nếu có readingId → Cập nhật chỉ số đã tồn tại
      if (readingId) {
        const numericValue = typeof rawReadingValue === 'string' ? parseFloat(rawReadingValue) : Number(rawReadingValue);
        
        // Validate giá trị
        if (isNaN(numericValue)) {
          errorCount++;
          lastError = `Giá trị chỉ số không hợp lệ cho ${feeType}`;
          return;
        }
        
        // Gọi API update
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
            // Xử lý các lỗi cụ thể
            if (errorMessage.includes('too low') || errorMessage.includes('SM35')) {
              lastError = 'Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + errorMessage;
            } else if (errorMessage.includes('locked') || errorMessage.includes('SM30')) {
              lastError = 'Chỉ số này đã bị khóa, không thể cập nhật. ' + errorMessage;
            } else {
              lastError = errorMessage || 'Lỗi cập nhật chỉ số';
            }
          })
        );
      } 
      // Nếu không có readingId → Tạo chỉ số mới
      else {
        const readingDate = this.getCurrentDate();
        const numericValue = typeof rawReadingValue === 'string' ? parseFloat(rawReadingValue) : Number(rawReadingValue);
        
        // Validate giá trị
        if (isNaN(numericValue)) {
          errorCount++;
          lastError = `Giá trị chỉ số không hợp lệ cho ${feeType}`;
          return;
        }
        
        // Gọi API create
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
              // Xử lý các lỗi cụ thể
              if (message.includes('tồn tại') || message.includes('exists') || message.includes('SM34')) {
                lastError = 'Đã có chỉ số trong tháng trước. ' + message;
              } else if (message.includes('too low') || message.includes('SM35')) {
                lastError = 'Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + message;
              } else {
                lastError = message || 'Lỗi không xác định';
              }
            }
          }).catch((error) => {
            errorCount++;
            const errorMessage = error.error?.message || error.error?.Message || '';
            // Xử lý các lỗi cụ thể
            if (errorMessage.includes('tồn tại') || errorMessage.includes('exists') || errorMessage.includes('SM34')) {
              lastError = 'Đã có chỉ số trong tháng trước. ' + errorMessage;
            } else if (errorMessage.includes('too low') || errorMessage.includes('SM35')) {
              lastError = 'Giá trị chỉ số phải lớn hơn hoặc bằng chỉ số trước đó. ' + errorMessage;
            } else {
              lastError = errorMessage || 'Lỗi tạo chỉ số';
            }
          })
        );
      }
    });

    // Chờ tất cả request hoàn thành, sau đó hiển thị kết quả
    Promise.all(updatePromises).then(() => {
      if (errorCount === 0) {
        // Tất cả thành công → Hiển thị thông báo và refresh form
        this.submitMessage = `Cập nhật thành công ${successCount} chỉ số`;
        this.submitMessageType = 'success';
        setTimeout(() => {
          this.checkExistingReadings();
          // Clear message sau 3 giây
          setTimeout(() => {
            this.submitMessage = '';
            this.submitMessageType = '';
          }, 3000);
        }, 1000);
      } else {
        // Có lỗi → Hiển thị thông báo lỗi, giữ nguyên form
        this.submitMessage = `Cập nhật ${successCount} thành công, ${errorCount} thất bại. ${lastError}`;
        this.submitMessageType = 'error';
        // Không gọi checkExistingReadings nếu có lỗi để giữ nguyên form
      }
      this.saving = false;
    }).catch(() => {
      this.submitMessage = 'Lỗi cập nhật chỉ số';
      this.submitMessageType = 'error';
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

  // Toast Notification Methods
  showToast(message: string, type: 'success' | 'error' = 'success', duration: number = 5000): void {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, duration);
  }

  hideToast(): void {
    this.toast.show = false;
  }

  // Hiển thị thông báo thành công
  showSuccess(message: string): void {
    this.showToast(message, 'success', 3000);
  }

  // Hiển thị thông báo lỗi
  showError(message: string): void {
    this.showToast(message, 'error', 5000);
  }
}
