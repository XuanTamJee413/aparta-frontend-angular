import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row mb-2 mb-xl-3">
      <div class="col-auto d-none d-sm-block">
        <h3><strong>System</strong> Settings</h3>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Settings</h5>
      </div>
      <div class="card-body">
        <p>System settings will be implemented here...</p>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent {}
