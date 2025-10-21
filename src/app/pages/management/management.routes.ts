import { ApartmentList } from './apartment-management/apartment-list/apartment-list.component';
import { ResidentList } from './resident-management/resident-list/resident-list';
import { Routes } from '@angular/router';

export const MANAGEMENT_ROUTES: Routes = [
  {

    path: 'manage-resident',
    component: ResidentList,
  },

  {
    path: 'manage-apartment',
    component: ApartmentList
  }
];
