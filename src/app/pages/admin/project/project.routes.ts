import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./view-project-list/project-list.component')
      .then(m => m.ProjectListComponent),
    title: 'Project List'
  },
  {
    path: 'create',
    loadComponent: () => import('./create-project/project-create.component')
      .then(m => m.ProjectCreateComponent),
    title: 'Create Project'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./update-project/project-edit.component')
      .then(m => m.ProjectEditComponent),
    title: 'Edit Project'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
