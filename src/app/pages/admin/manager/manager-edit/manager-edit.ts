import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Manager } from '../../../../models/manager.model';
import { ManagerService, UpdateManagerDto } from '../../../../services/admin/manager.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PhotoService } from '../../../../services/photo.service';

@Component({
  selector: 'app-manager-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manager-edit.html',
  styleUrls: ['./manager-edit.css']
})
export class ManagerEditComponent implements OnInit {
  managerId: string = '';
  currentManager: Manager | null = null;
  manager: UpdateManagerDto = {
    name: '',
    phone: '',
    email: '',
    password: '',
    staffCode: '',
    avatarUrl: '',
    status: '',
    buildingIds: []
  };

  allBuildings$!: Observable<BuildingDto[]>;
  statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Vô hiệu hóa' }
  ];

  loading = false;
  submitting = false;
  errorMessage = '';
  uploadingAvatar = false;
  avatarUploadError = '';
  currentAvatarUrl = '';
  readonly defaultAvatarUrl = '/img/avatars/avatar-1.jpg';

  constructor(
    private managerService: ManagerService,
    private buildingService: BuildingService,
    private router: Router,
    private route: ActivatedRoute,
    private photoService: PhotoService
  ) {}

  ngOnInit(): void {
    this.managerId = this.route.snapshot.paramMap.get('id') || '';
    
    // Tải danh sách tất cả các building
    this.allBuildings$ = this.buildingService.getAllBuildings().pipe(
      map(response => response.succeeded ? response.data?.items || [] : [])
    );
    
    if (this.managerId) {
      this.loadManagerData();
    } else {
      this.errorMessage = 'Manager ID not found';
    }
  }

  loadManagerData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.managerService.getAllManagers().subscribe({
      next: (response) => {
        if (response.succeeded) {
          const managers = response.data as Manager[];
          this.currentManager = managers.find(m =>
            m.userId.toLowerCase() === this.managerId.toLowerCase()
          ) || null;

          if (this.currentManager) {
            this.manager = {
              name: this.currentManager.name,
              phone: this.currentManager.phone,
              email: this.currentManager.email,
              staffCode: this.currentManager.staffCode,
              avatarUrl: this.currentManager.avatarUrl || '',
              password: '',
              status: this.currentManager.status,
              buildingIds: []
            };
            this.currentAvatarUrl = this.manager.avatarUrl || '';
            
            // Map assignedBuildings (mảng object) thành buildingIds (mảng string)
            if (this.currentManager.assignedBuildings && this.currentManager.assignedBuildings.length > 0) {
              this.manager.buildingIds = this.currentManager.assignedBuildings.map(b => b.buildingId);
            }
          } else {
            this.errorMessage = 'Manager not found';
          }
        } else {
          this.errorMessage = response.message || 'Failed to load manager data';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading manager data';
        this.loading = false;
        console.error('Error loading manager:', error);
      }
    });
  }

  onBuildingChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const buildingId = input.value;
    const isChecked = input.checked;

    if (isChecked) {
      if (!this.manager.buildingIds.includes(buildingId)) {
        this.manager.buildingIds.push(buildingId);
      }
    } else {
      this.manager.buildingIds = this.manager.buildingIds.filter(id => id !== buildingId);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.avatarUploadError = '';
    this.uploadingAvatar = true;

    this.photoService.uploadPhoto(file).subscribe({
      next: (response) => {
        this.currentAvatarUrl = response.url;
        this.manager.avatarUrl = response.url;
        this.uploadingAvatar = false;
      },
      error: (error) => {
        console.error('Error uploading avatar', error);
        this.avatarUploadError = error.error?.message || 'Upload ảnh thất bại, vui lòng thử lại.';
        this.uploadingAvatar = false;
      }
    });
  }

  onStaffCodeChange(value: string): void {
    const sanitized = (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    this.manager.staffCode = sanitized;
  }

  onPhoneInput(value: string): void {
    const sanitized = (value ?? '').replace(/\D/g, '').slice(0, 10);
    this.manager.phone = sanitized;
  }

  onSubmit(form?: NgForm): void {
    if (this.submitting || this.uploadingAvatar) return;

    if (form && form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const managerData: UpdateManagerDto = {
      name: this.manager.name,
      phone: this.manager.phone,
      email: this.manager.email,
      staffCode: this.manager.staffCode,
      status: this.manager.status,
      buildingIds: this.manager.buildingIds
    };

    if (this.manager.password && this.manager.password.trim()) {
      managerData.password = this.manager.password;
    }

    if (this.manager.avatarUrl && this.manager.avatarUrl.trim()) {
      managerData.avatarUrl = this.manager.avatarUrl;
    }

    console.log('Updating manager with data:', managerData);
    console.log('Manager ID:', this.managerId);

    this.managerService.updateManager(this.managerId, managerData).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.router.navigate(['/admin/manager/list']);
        } else {
          this.errorMessage = response.message || 'Failed to update manager';
          this.submitting = false;
        }
      },
      error: (error) => {
        console.error('Error updating manager:', error);
        this.errorMessage = error.error?.message || 'An error occurred while updating manager';
        this.submitting = false;
      }
    });
  }
}
