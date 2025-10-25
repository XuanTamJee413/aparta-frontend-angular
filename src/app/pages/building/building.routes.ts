import { Routes } from '@angular/router';
import { ApartmentList } from './management/apartment-management/apartment-list/apartment-list.component';
import { ResidentList } from './operation/resident-list/resident-list';

import { AssetList } from './management/asset-management/asset-list/asset-list.component';
import { ResidentDetail } from './operation/resident-management/resident-detail/resident-detail';
import { CreateAsset } from './management/asset-management/create-asset/create-asset';


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
  {
    path: 'manage-asset/create',
    component: CreateAsset
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
