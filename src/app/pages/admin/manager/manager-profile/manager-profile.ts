import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Manager } from '../../../../models/manager.model';
import { ManagerService } from '../../../../services/admin/manager.service';

@Component({
  selector: 'app-manager-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manager-profile.html',
  styleUrls: ['./manager-profile.css']
})
export class ManagerProfileComponent implements OnInit {
  managerId: string = '';
  manager: Manager | null = null;
  loading = false;
  errorMessage = '';
  readonly defaultAvatarUrl = '/img/avatars/avatar-1.jpg';

  constructor(
    private managerService: ManagerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.managerId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.managerId) {
      this.loadManagerProfile();
    } else {
      this.errorMessage = 'Manager ID not found';
    }
  }

  loadManagerProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.managerService.getAllManagers().subscribe({
      next: (response) => {
        if (response.succeeded) {
          const managers = response.data as Manager[];
          this.manager = managers.find(m =>
            m.userId.toLowerCase() === this.managerId.toLowerCase()
          ) || null;

          if (!this.manager) {
            this.errorMessage = 'Manager not found';
          }
        } else {
          this.errorMessage = response.message || 'Failed to load manager profile';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading manager profile';
        this.loading = false;
        console.error('Error loading manager profile:', error);
      }
    });
  }

  getAvatarUrl(): string {
    return this.manager?.avatarUrl || this.defaultAvatarUrl;
  }

  getStatusClass(): string {
    if (!this.manager?.status) return '';
    return this.manager.status.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Chưa đăng nhập';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}

