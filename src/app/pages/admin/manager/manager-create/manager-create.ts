import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateManagerRequest, ManagerService } from '../../../../services/admin/manager.service';

@Component({
  selector: 'app-manager-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manager-create.html',
  styleUrls: ['./manager-create.css']
})
export class ManagerCreateComponent {
  manager: CreateManagerRequest = {
    name: '',
    phone: '',
    password: '',
    email: '',
    staffCode: '',
    avatarUrl: ''
  };

  submitting = false;
  errorMessage = '';

  constructor(
    private managerService: ManagerService,
    private router: Router
  ) {}

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
