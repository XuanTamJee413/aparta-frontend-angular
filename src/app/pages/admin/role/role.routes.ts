import { Routes } from '@angular/router';
import { roleCanActivate } from '../../../guards/role.guard';

export const ROLE_ROUTES: Routes = [
  {
    path: 'list',
    canActivate: [roleCanActivate('admin')],
    loadComponent: () => import('./view-role-list/role-list.component')
      .then(m => m.RoleListComponent),
    title: 'Role List'
  },
  {
    path: 'edit/:id',
    canActivate: [roleCanActivate('admin')],
    loadComponent: () => import('./update-role/role-edit.component')
      .then(m => m.RoleEditComponent),
    title: 'Edit Role'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
