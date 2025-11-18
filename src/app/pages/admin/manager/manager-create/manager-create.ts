import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateManagerDto, ManagerService } from '../../../../services/admin/manager.service';
import { BuildingService, BuildingDto } from '../../../../services/admin/building.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  constructor(
    private managerService: ManagerService,
    private buildingService: BuildingService,
    private router: Router
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

  onSubmit(): void {
    if (this.submitting) return;

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
