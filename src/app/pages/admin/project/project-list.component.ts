import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row mb-2 mb-xl-3">
      <div class="col-auto d-none d-sm-block">
        <h3><strong>Project</strong> List</h3>
      </div>
      <div class="col-auto ms-auto text-end mt-n1">
        <a routerLink="/admin/project/create" class="btn btn-primary">New Project</a>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">All Projects</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Project Alpha</td>
                <td>Web development project</td>
                <td><span class="badge bg-success">Active</span></td>
                <td>2024-01-15</td>
                <td>
                  <a href="#" class="btn btn-sm btn-outline-primary">Edit</a>
                  <a href="#" class="btn btn-sm btn-outline-info">View</a>
                </td>
              </tr>
              <tr>
                <td>Project Beta</td>
                <td>Mobile app development</td>
                <td><span class="badge bg-warning">In Progress</span></td>
                <td>2024-01-20</td>
                <td>
                  <a href="#" class="btn btn-sm btn-outline-primary">Edit</a>
                  <a href="#" class="btn btn-sm btn-outline-info">View</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectListComponent {}
