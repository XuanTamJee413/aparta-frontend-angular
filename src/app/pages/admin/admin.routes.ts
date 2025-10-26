import { Routes } from '@angular/router';
import { ManagerListComponent } from './manager/manager-list/manager-list';
import { ManagerCreateComponent } from './manager/manager-create/manager-create';
import { ManagerEditComponent } from './manager/manager-edit/manager-edit';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard', // URL: /admin/dashboard
    loadComponent: () => import('./dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Admin Dashboard'
  },
  {
    path: 'project',
    loadChildren: () => import('./project/project.routes').then(m => m.PROJECT_ROUTES)
  },
  {
    path: 'building',
    loadChildren: () => import('./building/building.routes').then(m => m.BUILDING_ROUTES)
  },
  {
    path: 'subscription',
    loadChildren: () => import('./subscription/subscription.routes').then(m => m.SUBSCRIPTION_ROUTES)
  },

  //lấy all manager
  {
    path: 'manager/list', 
    component: ManagerListComponent,
    title: 'Manager List'
  },
  // tạo manager
  {
    path: 'manager/create', 
    component: ManagerCreateComponent,
    title: 'Create Manager'
  },
  // chỉnh sửa manager
  {
    path: 'manager/edit/:id',
    component: ManagerEditComponent,
    title: 'Edit Manager'
  },
  // {
  //   path: 'manager', // URL: /admin/manager
  //   redirectTo: 'manager/list',
  //   pathMatch: 'full'
  // },

  {
    path: 'settings', // URL: /admin/settings
    loadComponent: () => import('../common/settings.component')
      .then(m => m.SettingsComponent),
    title: 'Settings'
  },
  {
    path: 'profile', // URL: /admin/profile
    loadComponent: () => import('../common/profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Profile'
  },

  {
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full'
  }
];