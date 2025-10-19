import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row mb-2 mb-xl-3">
      <div class="col-auto d-none d-sm-block">
        <h3><strong>Edit</strong> Project</h3>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Edit Project Information</h5>
      </div>
      <div class="card-body">
        <p>Project edit form will be implemented here...</p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-primary">Save Changes</button>
          <button type="button" class="btn btn-secondary" routerLink="/admin/project/list">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectEditComponent {}
