import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Manager, ManagerService, UpdateManagerRequest } from '../../../../services/admin/manager.service';

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
  manager: UpdateManagerRequest = {
    name: '',
    phone: '',
    email: '',
    password: '',
    staffCode: '',
    avatarUrl: ''
  };

  loading = false;
  submitting = false;
  errorMessage = '';

  constructor(
    private managerService: ManagerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.managerId = this.route.snapshot.paramMap.get('id') || '';
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
              password: ''
            };
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

  onSubmit(): void {
    if (this.submitting) return;

    this.submitting = true;
    this.errorMessage = '';

    const managerData: UpdateManagerRequest = {
      name: this.manager.name,
      phone: this.manager.phone,
      email: this.manager.email,
      staffCode: this.manager.staffCode
    };

    if (this.manager.password && this.manager.password.trim()) {
      managerData.password = this.manager.password;
    }

    if (this.manager.avatarUrl && this.manager.avatarUrl.trim()) {
      managerData.avatarUrl = this.manager.avatarUrl;
    }

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
        this.errorMessage = error.error?.message || 'An error occurred while updating manager';
        this.submitting = false;
        console.error('Error updating manager:', error);
      }
    });
  }
}
