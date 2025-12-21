import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { VisitorComponent } from './visitor/visitor.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ChatComponent } from './chat/chat.component';
import { BookServiceComponent } from './service/book-service.component/book-service.component';
import { MyBookingsComponent } from './service/my-bookings.component/my-bookings.component';
import { BookUtilityComponent } from './utility/book-utility.component/book-utility.component';
import { MyUtilityBookingsComponent } from './utility/my-utility-bookings.component/my-utility-bookings.component';
import { NewsListComponent } from './news/news.list.component/news.list.component';
import { FacilityComponent } from './facility/facility.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileComponent } from '../common/profile/profile.component';
import { RegisterHousehold } from './household/register-household/register-household.component';
import { RegisterVehicle } from './vehicle/register-vehicle/register-vehicle.component';
import { MyInvoiceDetailComponent } from './invoice/my-invoice-detail/my-invoice-detail.component';
import { permissionGuard } from '../../guards/permission.guard';
import { authCanActivate } from '../../guards/auth.guard';
import { ChatShellComponent } from '../chat/chat-shell/chat-shell';
import { ResidentProposalComponent } from './proposal/proposal.component';

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
    canActivate: [authCanActivate, permissionGuard('invoice.resident.read')],
    component: MyInvoiceDetailComponent
  },
  {
    path: 'booking-service',
    canActivate: [permissionGuard('utility.create')],
    component: BookServiceComponent
  },
  {
    path: 'my-booking-service',
    canActivate: [permissionGuard('utility.read')],
    component: MyBookingsComponent
  },
  {
    path: 'booking-utility',
    canActivate: [permissionGuard('utility.create')],
    component: BookUtilityComponent
  },
  {
    path: 'my-booking-utility',
    canActivate: [permissionGuard('utility.read')],
    component: MyUtilityBookingsComponent
  },
  {
    path: 'news',
    canActivate: [permissionGuard('news.read')],
    component: NewsListComponent
  },
  {
    path: 'visitor',
    canActivate: [permissionGuard('visitor.create')],
    component: VisitorComponent
  },
  {
    path: 'household',
    canActivate: [permissionGuard('apartmentmember.read')],
    component: RegisterHousehold
  },
  {
    path: 'vehicle',
    component: RegisterVehicle
  },
  {
    path: 'facility',
    canActivate: [permissionGuard('utility.read')],
    component: FacilityComponent
  },
  {
    path: 'profile',
    canActivate: [permissionGuard('user.read')],
    component: ProfileComponent
  },
  {
    path: 'editprofile',
    canActivate: [permissionGuard('user.update')],
    component: EditProfileComponent
  },
  {
    path: 'chat',
    component: ChatShellComponent
  },
  {
    path: 'send-proposal',
    canActivate: [permissionGuard('proposal.create')],
    component: ResidentProposalComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

