import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { StaffAssignmentService } from '../../../../../services/management/staff-assignment.service';
import { StaffAssignmentDto, StaffUserDto, BuildingAssignmentDto } from '../../../../../models/staff-assignment.model';
import { BuildingDto } from '../../../../../services/admin/building.service';
import { Observable, startWith, map, combineLatest } from 'rxjs';

interface StaffGroup {
  name: string;
  staffs: StaffUserDto[];
}

@Component({
  selector: 'app-staff-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, 
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSelectModule, MatFormFieldModule, MatInputModule, NgIf
  ],
  templateUrl: './staff-assignment-dialog.component.html',
  styleUrls: ['./staff-assignment-dialog.component.css']
})
export class StaffAssignmentDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(StaffAssignmentService);
  private dialogRef = inject(MatDialogRef<StaffAssignmentDialogComponent>);
  
  @Inject(MAT_DIALOG_DATA) public data: { 
    mode: 'create' | 'edit', 
    assignment?: StaffAssignmentDto,
    buildings: BuildingAssignmentDto[] 
  } = inject(MAT_DIALOG_DATA);

  form: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';

  // Data gốc
  allBuildings: BuildingAssignmentDto[] = [];
  allStaffGroups: StaffGroup[] = [];

  // Form Controls cho Search trong Dropdown
  buildingSearchCtrl = new FormControl('');
  staffSearchCtrl = new FormControl('');

  // Observables cho UI (đã filter)
  filteredBuildings!: Observable<BuildingAssignmentDto[]>;
  filteredStaffGroups!: Observable<StaffGroup[]>;

  constructor() {
    this.isEditMode = this.data.mode === 'edit';
    this.allBuildings = this.data.buildings || [];
    
    this.form = this.fb.group({
      userId: [this.data.assignment?.userId || '', this.isEditMode ? [] : [Validators.required]],
      buildingId: [this.data.assignment?.buildingId || '', this.isEditMode ? [] : [Validators.required]],
      position: [this.data.assignment?.position || '', [Validators.required]],
      scopeOfWork: [this.data.assignment?.scopeOfWork || ''],
      startDate: [this.data.assignment?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0], [Validators.required]],
      endDate: [this.data.assignment?.endDate?.split('T')[0] || null],
      isActive: [this.data.assignment?.isActive ?? true]
    });

    if (this.isEditMode) {
      this.form.get('userId')?.disable();
      this.form.get('buildingId')?.disable();
      this.form.get('startDate')?.disable();
    }
  }

  ngOnInit(): void {
    // 1. Cấu hình Filter cho Building (Đã đúng)
    this.filteredBuildings = this.buildingSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(search => this._filterBuildings(search || ''))
    );

    // 2. [SỬA] Cấu hình Filter cho Staff Group NGAY TẠI ĐÂY
    this.filteredStaffGroups = this.staffSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(search => this._filterStaffGroups(search || ''))
    );

    if (!this.isEditMode) {
      this.loadStaffs();
      this.loadBuildings();
    }
  }

  loadStaffs() {
    // Gọi API lấy tất cả staff (không cần search term để lấy full list về client group)
    this.service.getAvailableStaffs('').subscribe({
      next: (res) => {
        const staffs = res.data || [];
        this.allStaffGroups = this._groupStaffs(staffs);
        this.staffSearchCtrl.setValue(this.staffSearchCtrl.value);
      },
      error: (err) => console.error('Lỗi tải danh sách nhân viên', err)
    });
  }

  loadBuildings() {
    this.service.getAvailableBuildings('').subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.allBuildings = res.data || [];
          this.buildingSearchCtrl.setValue(this.buildingSearchCtrl.value);
        }
      },
      error: (err) => console.error('Lỗi tải danh sách tòa nhà', err)
    });
  }

  // Logic Grouping
  private _groupStaffs(staffs: StaffUserDto[]): StaffGroup[] {
    const groups: Record<string, StaffUserDto[]> = {
      'Bảo trì (Maintain)': [],
      'Tài chính (Finance)': [],
      'Vận hành (Operation)': [],
      'Khác (Custom)': []
    };

    staffs.forEach(s => {
      const role = (s.roleName || '').toLowerCase();
      if (role.includes('maintenance')) {
        groups['Bảo trì (Maintain)'].push(s);
      } else if (role.includes('finance') || role.includes('account')) {
        groups['Tài chính (Finance)'].push(s);
      } else if (role.includes('operation')) {
        groups['Vận hành (Operation)'].push(s);
      } else {
        groups['Khác (Custom)'].push(s);
      }
    });

    // Chuyển đổi object thành array
    return Object.keys(groups).map(key => ({
      name: key,
      staffs: groups[key]
    })).filter(g => g.staffs.length > 0); // Chỉ lấy group có nhân viên
  }

  // Logic Filter Building
  private _filterBuildings(search: string): BuildingAssignmentDto[] {
    const filterValue = search.toLowerCase();
    return this.allBuildings.filter(b => 
      (b.name?.toLowerCase().includes(filterValue)) || 
      (b.buildingCode?.toLowerCase().includes(filterValue))
    );
  }

  // Logic Filter Staff Group
  private _filterStaffGroups(search: string): StaffGroup[] {
    if (!search) return this.allStaffGroups;
    const filterValue = search.toLowerCase();

    return this.allStaffGroups.map(group => ({
      name: group.name,
      // Lọc nhân viên trong từng group
      staffs: group.staffs.filter(s => 
        (s.name?.toLowerCase().includes(filterValue)) ||
        (s.staffCode?.toLowerCase().includes(filterValue)) ||
        (s.email?.toLowerCase().includes(filterValue))
      )
    })).filter(group => group.staffs.length > 0); // Loại bỏ group rỗng sau khi lọc
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const val = this.form.getRawValue();

    if (this.isEditMode) {
      // ... (Logic update giữ nguyên)
      const updateDto = {
        position: val.position,
        scopeOfWork: val.scopeOfWork,
        endDate: val.endDate || null,
        isActive: val.isActive
      };
      this.service.updateAssignment(this.data.assignment!.assignmentId, updateDto).subscribe({
        next: (res) => {
          if (res.succeeded) this.dialogRef.close(true);
          else this.errorMessage = res.message;
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Lỗi cập nhật.';
          this.isSubmitting = false;
        }
      });
    } else {
      // ... (Logic create giữ nguyên)
      const createDto = {
        userId: val.userId,
        buildingId: val.buildingId,
        position: val.position,
        scopeOfWork: val.scopeOfWork,
        startDate: val.startDate
      };
      this.service.assignStaff(createDto).subscribe({
        next: (res) => {
          if (res.succeeded) this.dialogRef.close(true);
          else this.errorMessage = res.message;
          this.isSubmitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Lỗi gán nhân viên.';
          this.isSubmitting = false;
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}