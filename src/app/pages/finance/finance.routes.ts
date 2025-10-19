import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/finance/dashboard',
    pathMatch: 'full'
  }
];