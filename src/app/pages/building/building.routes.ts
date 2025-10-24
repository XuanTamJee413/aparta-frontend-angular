import { Routes } from '@angular/router';
// Import các component có thật của bạn
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

  {
    path: 'manage-utility', // URL: .../building/manage-utility
    loadComponent: () => import('./operation/utility-list.component/utility-list.component') 
      .then(m => m.UtilityListComponent),
    title: 'Quản lý Tiện ích'
  },
  // --- END OPERATION  ---
  {
    path: '',
    redirectTo: 'manage-apartment',
    pathMatch: 'full'
  }
];