import { Routes } from '@angular/router';
// Import các component có thật của bạn
import { ApartmentList } from './management/apartment-management/apartment-list/apartment-list.component';
import { ResidentList } from './operation/resident-list/resident-list';
import { NewsListComponent } from './management/news/news-list/news-list';
import { NewsCreateComponent } from './management/news/news-create/news-create';
import { NewsEditComponent } from './management/news/news-edit/news-edit';

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
    path: 'news/list',
    component: NewsListComponent,
    title: 'News List'
  },
  {
    path: 'news/create',
    component: NewsCreateComponent,
    title: 'Create News'
  },
  {
    path: 'news/edit/:id',
    component: NewsEditComponent,
    title: 'Edit News'
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

  // --- END OPERATION  ---
  {
    path: '',
    redirectTo: 'manage-apartment',
    pathMatch: 'full'
  }
];