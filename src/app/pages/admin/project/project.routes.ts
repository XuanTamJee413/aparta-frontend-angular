import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./project-list.component')
      .then(m => m.ProjectListComponent),
    title: 'Project List'
  },
  {
    path: 'create',
    loadComponent: () => import('./project-create.component')
      .then(m => m.ProjectCreateComponent),
    title: 'Create Project'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./project-edit.component')
      .then(m => m.ProjectEditComponent),
    title: 'Edit Project'
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./project-detail.component')
      .then(m => m.ProjectDetailComponent),
    title: 'Project Detail'
  },
  {
    path: 'categories',
    loadComponent: () => import('./project-categories.component')
      .then(m => m.ProjectCategoriesComponent),
    title: 'Project Categories'
  },
  {
    path: 'reports',
    loadComponent: () => import('./project-reports.component')
      .then(m => m.ProjectReportsComponent),
    title: 'Project Reports'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
