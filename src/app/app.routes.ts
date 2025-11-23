import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { ManagerLayout } from './layout/manager-layout/manager-layout';
import { ResidentLayoutComponent } from './layout/resident-layout/resident-layout.component';
import { NotFound } from './pages/common/not-found/not-found';
import { LoginComponent } from './pages/auth/login/login.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { authCanMatch, authCanActivate } from './guards/auth.guard';
import { roleCanMatch, roleCanActivate } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authCanActivate],
  },
  
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent,
  },
  
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [authCanActivate],
  },
  
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/common/forbidden/forbidden').then(m => m.Forbidden)
  },
  
  // {
  //   path: 'admin',
  //   component: AdminLayout, 
  //   canActivate: [authCanActivate, roleCanActivate(['admin','custom'])],
  //   loadChildren: () => import('./pages/admin/admin.routes')
  //     .then(m => m.ADMIN_ROUTES)
  // },

  {
    path: 'manager',
    component: ManagerLayout, 
    canActivate: [authCanActivate, roleCanActivate(['staff','admin','custom'])],
    loadChildren: () => import('./pages/building/building.routes')
      .then(m => m.MANAGER_ROUTES)
  },
  
  {
    path: '', 
    component: ResidentLayoutComponent, 
    canActivate: [authCanActivate, roleCanActivate(['resident','admin','custom'])],
    loadChildren: () => import('./pages/resident/resident.routes')
      .then(m => m.RESIDENT_ROUTES)
  },
  
  {
    path: '**', 
    component: NotFound,
    pathMatch: 'full'
  }
];
