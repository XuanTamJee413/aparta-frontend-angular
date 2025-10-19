import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row mb-2 mb-xl-3">
      <div class="col-auto d-none d-sm-block">
        <h3><strong>Project</strong> Categories</h3>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Manage Categories</h5>
      </div>
      <div class="card-body">
        <p>Project categories management will be implemented here...</p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-primary">Add Category</button>
          <button type="button" class="btn btn-secondary" routerLink="/admin/project/list">Back to Projects</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectCategoriesComponent {}
