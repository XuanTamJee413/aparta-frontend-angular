import { Routes } from '@angular/router';
import { ApartmentList } from './management/apartment-management/apartment-list/apartment-list.component';
import { ResidentList } from './operation/resident-list/resident-list';
export const MANAGER_ROUTES: Routes = [
  // --- MANAGEMENT ---
  {
    path: 'manage-resident', 
    component: ResidentList,
  },
  {
    path: 'manage-apartment', 
    component: ApartmentList
  },
  // --- END MANAGEMENT ---


  // --- FINANCE  ---
  {
    path: 'payment-receipt', 
    loadComponent: () => import('./finance/view-payment-receipt/view-payment-receipt') 
      .then(m => m.ViewPaymentReceipt)
  },
  // --- END FINANCE  ---

  // --- OPERATION  ---
  {
    path: 'resident-list', 
    loadComponent: () => import('./operation/resident-list/resident-list') 
      .then(m => m.ResidentList)
  },
  {
    path: 'visitor-list',
    loadComponent: () => import('./operation/visitor/visitor-list/visitor-list') 
      .then(m => m.VisitorList)
  },

  {
    path: 'profile',
    loadComponent: () => import('../common/profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Profile'
  },

  {
    path: 'manage-service', // Đây là URL: .../building/manage-service
    loadComponent: () => import('./operation/service-list.component/service-list.component') 
      .then(m => m.ServiceListComponent),
    title: 'Quản lý Dịch vụ'
  },

  // --- END OPERATION  ---
  {
    path: '',
    redirectTo: 'manage-apartment',
    pathMatch: 'full'
  }
];