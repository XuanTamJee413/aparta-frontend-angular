import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { VisitorComponent } from './visitor/visitor.component';
import { ResidentLayoutComponent } from './resident-layout.component';

export const RESIDENT_ROUTES: Routes = [
    {
    // Tất cả các đường dẫn bắt đầu bằng /resident sẽ tải ResidentLayoutComponent làm khung chính
    path: '',
    component: ResidentLayoutComponent,
    children: [
      {
        // Khi URL là /resident/dashboard, nó sẽ hiển thị HomepageComponent bên trong layout.
        // Điều này khớp với routerLink="dashboard" trong sidebar của bạn.
        path: 'home',
        component: HomepageComponent
      },
      {
        // Khi URL là /resident/visitors, nó sẽ hiển thị VisitorComponent bên trong layout.
        // Điều này khớp với routerLink="visitors".
        path: 'visitors',
        component: VisitorComponent
      },
      // TODO: Thêm các route cho các trang con khác (bills, issues...) ở đây
      // Ví dụ: { path: 'bills', component: BillsComponent },

      // Nếu người dùng chỉ truy cập /resident, tự động chuyển hướng họ đến trang dashboard.
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

