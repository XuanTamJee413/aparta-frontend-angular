import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { ManagerLayout } from './layout/manager-layout/manager-layout';
import { ResidentLayoutComponent } from './layout/resident-layout/resident-layout.component';
import { NotFound } from './pages/common/not-found/not-found';
import { LoginComponent } from './pages/auth/login.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayout,
    loadChildren: () => import('./pages/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  },

  {
    path: 'manager',
    component: ManagerLayout,
    loadChildren: () => import('./pages/building/building.routes')
      .then(m => m.MANAGER_ROUTES)
  },
{
    path: '',
    component: LoginComponent,
    pathMatch: 'full'
  },

  {
    path: '',
    component: ResidentLayoutComponent,
     loadChildren: () => import('./pages/resident/resident.routes')
      .then(m => m.RESIDENT_ROUTES)
  }
];
