import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row mb-2 mb-xl-3">
      <div class="col-auto d-none d-sm-block">
        <h3><strong>User</strong> Profile</h3>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Profile Information</h5>
      </div>
      <div class="card-body">
        <p>User profile will be implemented here...</p>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent {}
