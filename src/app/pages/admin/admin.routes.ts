import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Admin Dashboard'
  },
  {
    path: 'settings',
    loadComponent: () => import('../common/settings.component')
      .then(m => m.SettingsComponent),
    title: 'Settings'
  },
  {
    path: 'profile',
    loadComponent: () => import('../common/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Profile'
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
