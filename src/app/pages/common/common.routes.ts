import { Routes } from '@angular/router';

export const COMMON_ROUTES: Routes = [
  {
    path: 'settings', 
    loadComponent: () => import('./settings/settings.component')
      .then(m => m.SettingsComponent),
    title: 'Settings'
  },
  {
    path: 'profile', 
    loadComponent: () => import('./profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Profile'
  },
];