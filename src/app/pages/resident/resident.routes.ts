import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { VisitorComponent } from './visitor/visitor.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ChatComponent } from './chat/chat.component';
import { BookServiceComponent } from './service/book-service.component/book-service.component';
import { MyBookingsComponent } from './service/my-bookings.component/my-bookings.component';
import { FacilityComponent } from './facility/facility.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileComponent } from '../common/profile/profile.component';
import { RegisterHousehold } from './household/register-household/register-household.component';
import { RegisterVehicle } from './vehicle/register-vehicle/register-vehicle.component';
import { MyInvoiceDetailComponent } from './invoice/my-invoice-detail/my-invoice-detail.component';
import { permissionGuard } from '../../guards/permission.guard';
import { authCanActivate } from '../../guards/auth.guard';

export const RESIDENT_ROUTES: Routes = [
    {
    path: 'home',
    component: HomepageComponent
  },
  {
    path: 'invoice',
    canActivate: [permissionGuard('invoice.resident.read')],
    component: InvoiceComponent
  },
  {
    path: 'my-invoice-detail/:id',
    canActivate: [authCanActivate],
    component: MyInvoiceDetailComponent
  },
  {
    path: 'booking-service',
    component: BookServiceComponent
  },
  {
    path: 'my-booking-service',
    component: MyBookingsComponent
  },
  {
    path: 'news',
    component: AnnouncementComponent
  },
  {
    path: 'visitor',
    component: VisitorComponent
  },
  {
    path: 'household',
    component:RegisterHousehold
  },
   {
    path: 'vehicle',
    component:RegisterVehicle
  },
  {
    path: 'facility',
    component: FacilityComponent
  },
  {
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'editprofile',
    component: EditProfileComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

