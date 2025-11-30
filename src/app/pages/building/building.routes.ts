import { Routes } from '@angular/router';
import { ApartmentList } from './management/apartment-management/apartment-list/apartment-list.component';
import { ResidentList } from './operation/resident-management/resident-list/resident-list.component';
import { NewsListComponent } from './management/news/news-list/news-list';
import { NewsCreateComponent } from './management/news/news-create/news-create';
import { NewsEditComponent } from './management/news/news-edit/news-edit';

import { AssetList } from './management/asset-management/asset-list/asset-list.component';
import { ResidentDetail } from './operation/resident-management/resident-detail/resident-detail.component';
import { CreateAsset } from './management/asset-management/create-asset/create-asset.component';
import { VehicleList } from './operation/vehicle-management/vehicle-list/vehicle-list.component';
import { PriceQuotationFormComponent } from './management/price-quotation/pricequotation-form/pricequotation-form';
import { PriceQuotationListComponent } from './management/price-quotation/pricequotation-list/pricequotation-list';

import { permissionGuard } from '../../guards/permission.guard';

import { EditApartment } from './management/apartment-management/edit-apartment/edit-apartment.component';
import { EditAsset } from './management/asset-management/edit-asset/edit-asset';
import { CreateApartment } from './management/apartment-management/create-apartment/create-apartment';
import { ContractList } from './management/contract-management/contract-list/contract-list.component';
import { CreateContract } from './management/contract-management/create-contract/create-contract';
import { ContractDetail } from './management/contract-management/contract-detail/contract-detail.component';
import { UpdateContract } from './management/contract-management/update-contract/update-contract';
import { ChatShellComponent } from '../chat/chat-shell/chat-shell';

import { StaffAssignmentListComponent } from './management/staff-assignment/staff-assignment-list/staff-assignment-list.component';

export const MANAGER_ROUTES: Routes = [
  // --- MANAGEMENT ---
  { path: 'manage-resident', component: ResidentList },
  { path: 'manage-apartment', component: ApartmentList },
  { path: 'manage-apartment/create', component: CreateApartment },
  { path: 'manage-apartment/edit/:id', component: EditApartment },
  { path: 'manage-contract', component: ContractList },
  { path: 'manage-contract/create', component: CreateContract },
  { path: 'manage-contract/detail/:id', component: ContractDetail },
  { path: 'manage-contract/update/:id', component: UpdateContract },
  { path: 'manage-asset', component: AssetList },
  { path: 'manage-asset/create', component: CreateAsset },
  { path: 'manage-asset/edit/:id', component: EditAsset },
  { path: 'news/list', component: NewsListComponent, title: 'News List' },
  { path: 'news/create', component: NewsCreateComponent, title: 'Create News' },
  { path: 'news/edit/:id', component: NewsEditComponent, title: 'Edit News' },
  { path: 'manage-quotation', canActivate: [permissionGuard('visitor.read')], component: PriceQuotationListComponent },
  { path: 'manage-quotation/new', component: PriceQuotationFormComponent },
  { path: 'manage-quotation/edit/:id', component: PriceQuotationFormComponent },
  { 
    path: 'manage-staff-assignment', 
    canActivate: [permissionGuard('staffassignment.read')], 
    component: StaffAssignmentListComponent,
    title: 'Quản lý Phân công Nhân viên'
  },

  // --- END MANAGEMENT ---

  // --- FINANCE  ---
  { path: 'payment-receipt', loadComponent: () => import('./finance/view-payment-receipt/view-payment-receipt').then(m => m.ViewPaymentReceipt) },
  { path: 'invoice-management', loadComponent: () => import('./finance/invoice-management/invoice-management.component').then(m => m.InvoiceManagementComponent), title: 'Quản lý Hóa đơn' },
  { path: 'invoice-detail/:invoiceId', loadComponent: () => import('./finance/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent), title: 'Chi tiết Hóa đơn' },
  // --- END FINANCE  ---

  // --- OPERATION  ---
  { path: 'resident-list', loadComponent: () => import('./operation/resident-management/resident-list/resident-list.component').then(m => m.ResidentList) }, // Giữ bản tối giản từ Son
  { path: 'resident-list/detail/:id', component: ResidentDetail },
  { path: 'visitor-list', canActivate: [permissionGuard('visitor.read')], loadComponent: () => import('./operation/visitor/visitor-list/visitor-list').then(m => m.VisitorList) },
  { path: 'vehicle-list', component: VehicleList }, // Giữ từ HEAD
  { path: 'fast-checkin', canActivate: [permissionGuard('visitor.create')], loadComponent: () => import('./operation/visitor/fast-checkin/fast-checkin').then(m => m.FastCheckin) },
  { path: 'profile', loadComponent: () => import('../common/profile/profile.component').then(m => m.ProfileComponent), title: 'Profile' },
  { path: 'manage-service', loadComponent: () => import('./operation/service-list.component/service-list.component').then(m => m.ServiceListComponent), title: 'Quản lý Dịch vụ' },
  { path: 'manage-utility', loadComponent: () => import('./operation/utility-list.component/utility-list.component').then(m => m.UtilityListComponent), title: 'Quản lý Tiện ích' },
  {
    path: 'service-bookings',
    loadComponent: () => import('./operation/booking-management.component/booking-management.component')
      .then(m => m.BookingManagementComponent),
    title: 'Quản lý Đặt Dịch Vụ'
  },
    {
    path: 'utility-bookings', 
    loadComponent: () => import('./operation/utility-booking-management.component/utility-booking-management.component') 
      .then(m => m.UtilityBookingManagementComponent),
    title: 'Quản lý Đặt Tiện Ích'
  },
  {
    path: 'manage-task',
    loadComponent: () => import('./operation/task-list.component/task-list.component')
      .then(m => m.TaskListComponent),
    title: 'Quản lý Công việc'
  },
  { path: 'meter-reading-form', canActivate: [permissionGuard(['meterreading.read', 'meterreading.create'])], loadComponent: () => import('./operation/meter-reading-form/meter-reading-form.component').then(m => m.MeterReadingFormComponent), title: 'Nhập chỉ số điện nước' },
  { path: 'meter-reading-status', canActivate: [permissionGuard(['meterreading.read.status'])], loadComponent: () => import('./operation/meter-reading-status/meter-reading-status.component').then(m => m.MeterReadingStatusComponent), title: 'Báo cáo Tình trạng Ghi chỉ số' },
  {
    path: 'chat',
    component: ChatShellComponent,
  },
  { path: 'create-one-time-invoice', canActivate: [permissionGuard('invoice.pay.create')], loadComponent: () => import('./operation/create-one-time-invoice/create-one-time-invoice.component').then(m => m.CreateOneTimeInvoiceComponent), title: 'Tạo Phiếu Thu' },

  // --- MAINTENANCE  ---
  {
    path: 'my-tasks',
    loadComponent: () => import('./maintenance/my-task-list.component/my-task-list.component')
      .then(m => m.MyTaskListComponent),
    title: 'Công việc của tôi'
  },
  // --- END OPERATION  ---

  { path: '', redirectTo: 'manage-apartment', pathMatch: 'full' }
];
