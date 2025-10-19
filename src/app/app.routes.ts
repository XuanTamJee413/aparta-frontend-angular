import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.routes')
          .then(m => m.ADMIN_ROUTES) 
      },
      {
        path: 'admin/project',
        loadChildren: () => import('./pages/admin/project/project.routes')
          .then(m => m.PROJECT_ROUTES)
      },
      {
        path: 'finance',
        loadChildren: () => import('./pages/finance/finance.routes')
          .then(m => m.FINANCE_ROUTES)
      },
      {
        path: 'management',
        loadChildren: () => import('./pages/management/management.routes')
          .then(m => m.MANAGEMENT_ROUTES)
      },
      {
        path: 'operation',
        loadChildren: () => import('./pages/operation/operation.routes')
          .then(m => m.OPERATION_ROUTES)
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
  }
];