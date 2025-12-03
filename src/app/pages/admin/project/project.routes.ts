import { Routes } from '@angular/router';
import { permissionGuard } from '../../../guards/permission.guard';

export const PROJECT_ROUTES: Routes = [
  {
    path: 'list',
    canActivate: [permissionGuard('project.read')],
    loadComponent: () => import('./view-project-list/project-list.component')
      .then(m => m.ProjectListComponent),
    title: 'Quản lý Dự án'
  },
  {
    path: 'create',
    canActivate: [permissionGuard('project.create')],
    loadComponent: () => import('./create-project/project-create.component')
      .then(m => m.ProjectCreateComponent),
    title: 'Tạo Dự án'
  },
  {
    path: 'edit/:id',
    canActivate: [permissionGuard('project.update')],
    loadComponent: () => import('./update-project/project-edit.component')
      .then(m => m.ProjectEditComponent),
    title: 'Chỉnh sửa Dự án'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
