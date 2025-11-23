import { Routes } from '@angular/router';
import { roleCanActivate } from '../../guards/role.guard';

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
  {
    path: 'manager',
    loadChildren: () => import('./manager/manager.routes').then(m => m.MANAGER_ROUTES)
  },

  {
    path: 'role',
    loadChildren: () => import('./role/role.routes').then(m => m.ROLE_ROUTES)
  },

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