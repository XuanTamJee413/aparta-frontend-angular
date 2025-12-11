import { Routes } from '@angular/router';
import { roleCanActivate } from '../../../guards/role.guard';

export const ROLE_ROUTES: Routes = [
  {
    path: 'list',
    canActivate: [roleCanActivate('admin')],
    loadComponent: () => import('./view-role-list/role-list.component')
      .then(m => m.RoleListComponent),
    title: 'Quản lý Phân quyền'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
