import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { VisitorComponent } from './visitor/visitor.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ChatComponent } from './chat/chat.component';
import { ServiceComponent } from './service/service.component';
import { FacilityComponent } from './facility/facility.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileComponent } from '../common/profile/profile.component';
import { RegisterHousehold } from './household/register-household/register-household';

export const RESIDENT_ROUTES: Routes = [
    {
    path: 'home',
    component: HomepageComponent
  },
  {
    path: 'invoice',
    component: InvoiceComponent
  },
  {
    path: 'service',
    component: ServiceComponent
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

