import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateManagerDto, ManagerService } from '../../../../services/admin/manager.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PhotoService } from '../../../../services/photo.service';

@Component({
  selector: 'app-manager-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manager-create.html',
  styleUrls: ['./manager-create.css']
})
export class ManagerCreateComponent implements OnInit {
  manager: CreateManagerDto = {
    name: '',
    phone: '',
    password: '',
    email: '',
    staffCode: '',
    avatarUrl: '',
    buildingIds: []
  };

  allBuildings$!: Observable<BuildingDto[]>;
  submitting = false;
  errorMessage = '';
  uploadingAvatar = false;
  avatarUploadError = '';
  currentAvatarUrl = '';
  readonly defaultAvatarUrl = '/img/avatars/avatar.jpg';

  constructor(
    private managerService: ManagerService,
    private buildingService: BuildingService,
    private router: Router,
    private photoService: PhotoService
  ) {}

  ngOnInit(): void {
    // Tải danh sách tất cả các building
    this.allBuildings$ = this.buildingService.getAllBuildings().pipe(
      map(response => response.succeeded ? response.data?.items || [] : [])
    );
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
    const sanitized = (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.manager.staffCode = sanitized;
  }

  onSubmit(form?: NgForm): void {
    if (this.submitting || this.uploadingAvatar) return;

    if (form && form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.errorMessage = '';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    // xóa ảnh đại diện nếu không có URL
    const managerData = { ...this.manager };
    if (!managerData.avatarUrl) {
      delete managerData.avatarUrl;
    }

    this.managerService.createManager(managerData).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.router.navigate(['/admin/manager/list']);
        } else {
          this.errorMessage = response.message || 'Failed to create manager';
          this.submitting = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while creating manager';
        this.submitting = false;
        console.error('Error creating manager:', error);
      }
    });
  }
}
