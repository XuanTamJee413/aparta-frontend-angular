import { Routes } from '@angular/router';

export const MANAGER_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./manager-list/manager-list')
      .then(m => m.ManagerListComponent),
    title: 'Quản lý Manager'
  },
  {
    path: 'create',
    loadComponent: () => import('./manager-create/manager-create')
      .then(m => m.ManagerCreateComponent),
    title: 'Tạo Manager mới'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./manager-edit/manager-edit')
      .then(m => m.ManagerEditComponent),
    title: 'Chỉnh sửa Manager'
  },

  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];

