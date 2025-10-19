import { Routes } from '@angular/router';

export const COMMON_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full'
  }
];