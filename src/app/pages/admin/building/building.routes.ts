import { Routes } from '@angular/router';
import { permissionGuard } from '../../../guards/permission.guard';

export const BUILDING_ROUTES: Routes = [
  {
    path: 'list',
    canActivate: [permissionGuard('building.read')],
    loadComponent: () => import('./view-building-list/building-list.component')
      .then(m => m.BuildingListComponent),
    title: 'Quản lý Tòa nhà'
  },
  {
    path: 'create',
    canActivate: [permissionGuard('building.create')],
    loadComponent: () => import('./create-building/building-create.component')
      .then(m => m.BuildingCreateComponent),
    title: 'Tạo Tòa nhà'
  },
  {
    path: 'edit/:id',
    canActivate: [permissionGuard('building.update')],
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
