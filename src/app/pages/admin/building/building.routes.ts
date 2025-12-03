import { Routes } from '@angular/router';

export const BUILDING_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./view-building-list/building-list.component')
      .then(m => m.BuildingListComponent),
    title: 'Quản lý Tòa nhà'
  },
  {
    path: 'create',
    loadComponent: () => import('./create-building/building-create.component')
      .then(m => m.BuildingCreateComponent),
    title: 'Tạo Tòa nhà'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./update-building/building-edit.component')
      .then(m => m.BuildingEditComponent),
    title: 'Chỉnh sửa Tòa nhà'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
