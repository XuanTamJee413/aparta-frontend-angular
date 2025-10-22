import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { ManagerLayout } from './layout/manager-layout/manager-layout';
import { ResidentLayoutComponent } from './pages/resident/resident-layout.component';
import { NotFound } from './pages/common/not-found/not-found';

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
    component: ResidentLayoutComponent, 
    loadChildren: () => import('./pages/resident/resident.routes')
      .then(m => m.RESIDENT_ROUTES)
  },
  
  {
    path: '**', 
    component: NotFound,
    pathMatch: 'full'
  }
];
