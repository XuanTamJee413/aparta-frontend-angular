import { Routes } from '@angular/router';
// Import các component có thật của bạn
import { ApartmentList } from './management/apartment-management/apartment-list/apartment-list.component';
import { ResidentList } from './operation/resident-list/resident-list';
import { AssetList } from './management/asset-management/asset-list/asset-list.component';
import { ResidentDetail } from './operation/resident-management/resident-detail/resident-detail';

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
  {
    path: 'manage-asset',
    component: AssetList
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
    path: 'resident-list/detail/:id',
    component: ResidentDetail
  },

  {
    path: 'profile',
    loadComponent: () => import('../common/profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Profile'
  },

  // --- END OPERATION  ---
  {
    path: '',
    redirectTo: 'manage-apartment',
    pathMatch: 'full'
  }
];
