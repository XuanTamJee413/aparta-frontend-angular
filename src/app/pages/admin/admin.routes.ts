import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard', // URL: /admin/dashboard
    loadComponent: () => import('./dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Admin Dashboard'
  },
  
  {
    path: 'project-list', // URL: /admin/project-list
    loadComponent: () => import('./project/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'project-create', // URL: /admin/project-create
    loadComponent: () => import('./project/project-create.component').then(m => m.ProjectCreateComponent)
  },
  {
    path: 'project-categories', // URL: /admin/project-categories
    loadComponent: () => import('./project/project-categories.component').then(m => m.ProjectCategoriesComponent)
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