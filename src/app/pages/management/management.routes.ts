import { Routes } from '@angular/router';

export const MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/management/dashboard',
    pathMatch: 'full'
  }
];