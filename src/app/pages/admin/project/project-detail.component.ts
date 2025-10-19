import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row mb-2 mb-xl-3">
      <div class="col-auto d-none d-sm-block">
        <h3><strong>Project</strong> Detail</h3>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Project Details</h5>
      </div>
      <div class="card-body">
        <p>Project detail view will be implemented here...</p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-primary" routerLink="/admin/project/edit/1">Edit Project</button>
          <button type="button" class="btn btn-secondary" routerLink="/admin/project/list">Back to List</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectDetailComponent {}
