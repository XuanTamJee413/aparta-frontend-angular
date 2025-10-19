import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="row mb-2 mb-xl-3">
      <div class="col-auto d-none d-sm-block">
        <h3><strong>Create</strong> Project</h3>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Project Information</h5>
      </div>
      <div class="card-body">
        <form>
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="projectName" class="form-label">Project Name</label>
                <input type="text" class="form-control" id="projectName" placeholder="Enter project name">
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="projectCategory" class="form-label">Category</label>
                <select class="form-select" id="projectCategory">
                  <option selected>Choose category...</option>
                  <option value="web">Web Development</option>
                  <option value="mobile">Mobile App</option>
                  <option value="desktop">Desktop Application</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="projectDescription" class="form-label">Description</label>
            <textarea class="form-control" id="projectDescription" rows="3" placeholder="Enter project description"></textarea>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="startDate" class="form-label">Start Date</label>
                <input type="date" class="form-control" id="startDate">
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="endDate" class="form-label">End Date</label>
                <input type="date" class="form-control" id="endDate">
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="projectStatus" class="form-label">Status</label>
            <select class="form-select" id="projectStatus">
              <option value="planning">Planning</option>
              <option value="active" selected>Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">Create Project</button>
            <button type="button" class="btn btn-secondary" routerLink="/admin/project/list">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectCreateComponent {}
