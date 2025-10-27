import { Routes } from '@angular/router';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./view-subscription-list/subscription-list.component')
      .then(m => m.SubscriptionListComponent),
    title: 'Quản lý Gói dịch vụ'
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
