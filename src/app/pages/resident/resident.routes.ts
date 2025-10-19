import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { VisitorComponent } from './visitor/visitor.component';
import { ResidentLayoutComponent } from './resident-layout.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { ServiceComponent } from './service/service.component';
import { FacilityComponent } from './facility/facility.component';
import { AnnouncementComponent } from './announcement/announcement.component';

export const RESIDENT_ROUTES: Routes = [
    {
    path: '',
    component: ResidentLayoutComponent,
    children: [
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
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

