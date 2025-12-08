import { Routes } from '@angular/router';
import { permissionGuard } from '../../guards/permission.guard';
import { roleCanActivate } from '../../guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'project',
    canActivate: [permissionGuard('project.read')],
    loadChildren: () => import('./project/project.routes').then(m => m.PROJECT_ROUTES)
  },
  {
    path: 'building',
    canActivate: [permissionGuard('building.read')],
    loadChildren: () => import('./building/building.routes').then(m => m.BUILDING_ROUTES)
  },
  {
    path: 'subscription',
    canActivate: [roleCanActivate('admin')],
    loadChildren: () => import('./subscription/subscription.routes').then(m => m.SUBSCRIPTION_ROUTES)
  },
  {
    path: 'manager',
    canActivate: [permissionGuard('manager.read')],
    loadChildren: () => import('./manager/manager.routes').then(m => m.MANAGER_ROUTES)
  },

  {
    path: 'role',
    canActivate: [roleCanActivate('admin')],
    loadChildren: () => import('./role/role.routes').then(m => m.ROLE_ROUTES)
  },

  {
    path: 'settings', // URL: /admin/settings
    loadComponent: () => import('../common/settings/settings.component')
      .then(m => m.SettingsComponent),
    title: 'Cài đặt Chung'
  },
  {
    path: 'profile', // URL: /admin/profile
    loadComponent: () => import('../common/profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Hồ sơ Cá Nhân'
  },

  {
    path: 'dashboard',
    canActivate: [permissionGuard('dashboard.read')],
    loadComponent: () => import('./dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    title: 'Bảng Điều Khiển'
  },
  
  {
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full'
  }
];