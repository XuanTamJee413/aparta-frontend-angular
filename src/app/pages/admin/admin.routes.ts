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