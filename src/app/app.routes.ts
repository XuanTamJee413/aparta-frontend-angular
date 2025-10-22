import { Routes } from '@angular/router';
import { authCanMatch } from './guards/auth.guard';
import { roleCanMatch } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.routes')
          .then(m => m.ADMIN_ROUTES)
        , canMatch: [authCanMatch, roleCanMatch('admin')]
      },
      {
        path: 'admin/project',
        loadChildren: () => import('./pages/admin/project/project.routes')
          .then(m => m.PROJECT_ROUTES)
        , canMatch: [authCanMatch, roleCanMatch('admin')]
      },
      {
        path: 'finance',
        loadChildren: () => import('./pages/finance/finance.routes')
          .then(m => m.FINANCE_ROUTES)
        , canMatch: [authCanMatch, roleCanMatch(['admin', 'staff'])]
      },
      {
        path: 'management',
        loadChildren: () => import('./pages/management/management.routes')
          .then(m => m.MANAGEMENT_ROUTES)
        , canMatch: [authCanMatch, roleCanMatch(['admin', 'staff'])]
      },
      {
        path: 'operation',
        loadChildren: () => import('./pages/operation/operation.routes')
          .then(m => m.OPERATION_ROUTES)
        , canMatch: [authCanMatch, roleCanMatch(['admin', 'staff'])]
      },
      {
        path: 'common',
        loadChildren: () => import('./pages/common/common.routes')
          .then(m => m.COMMON_ROUTES)
      },
      {
        path: '',
        redirectTo: '/common/homepage',
        pathMatch: 'full'
      }
    ]

  },
  {
    path: 'resident',
    loadChildren: () => import('./pages/resident/resident.routes')
      .then(m => m.RESIDENT_ROUTES)
    , canMatch: [authCanMatch, roleCanMatch('resident')]
  }
  ,
  { path: '**', redirectTo: '/login' }
];

