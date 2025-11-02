import { Routes } from '@angular/router';
import { ApartmentList } from './management/apartment-management/apartment-list/apartment-list.component';
import { ResidentList } from './operation/resident-list/resident-list';
import { NewsListComponent } from './management/news/news-list/news-list';
import { NewsCreateComponent } from './management/news/news-create/news-create';
import { NewsEditComponent } from './management/news/news-edit/news-edit';
import { AssetList } from './management/asset-management/asset-list/asset-list.component';
import { ResidentDetail } from './operation/resident-management/resident-detail/resident-detail';
import { CreateAsset } from './management/asset-management/create-asset/create-asset';
import { VehicleList } from './operation/vehicle-management/vehicle-list/vehicle-list';
import { PriceQuotationFormComponent } from './management/price-quotation/pricequotation-form/pricequotation-form';
import { PriceQuotationListComponent } from './management/price-quotation/pricequotation-list/pricequotation-list';
import { permissionGuard } from '../../guards/permission.guard';

export const MANAGER_ROUTES: Routes = [
  // --- MANAGEMENT ---
  { path: 'manage-resident', component: ResidentList },
  { path: 'manage-apartment', component: ApartmentList },
  { path: 'manage-asset', component: AssetList },
  { path: 'manage-asset/create', component: CreateAsset },
  { path: 'news/list', component: NewsListComponent, title: 'News List' },
  { path: 'news/create', component: NewsCreateComponent, title: 'Create News' },
  { path: 'news/edit/:id', component: NewsEditComponent, title: 'Edit News' },
  { path: 'manage-quotation', component: PriceQuotationListComponent }, // Thêm từ HEAD
  { path: 'manage-quotation/new', component: PriceQuotationFormComponent }, // Thêm từ HEAD
  { path: 'manage-quotation/edit/:id', component: PriceQuotationFormComponent }, // Thêm từ HEAD

  // --- END MANAGEMENT ---

  // --- FINANCE  ---
  { path: 'payment-receipt', loadComponent: () => import('./finance/view-payment-receipt/view-payment-receipt').then(m => m.ViewPaymentReceipt) },
  { path: 'invoice-list', loadComponent: () => import('./finance/view-invoice-list/view-invoice-list.component').then(m => m.ViewInvoiceListComponent), title: 'Danh sách hóa đơn' },
  // --- END FINANCE  ---

  // --- OPERATION  ---
  { path: 'resident-list', loadComponent: () => import('./operation/resident-list/resident-list').then(m => m.ResidentList) }, // Giữ bản tối giản từ Son
  { path: 'resident-list/detail/:id', component: ResidentDetail },
  { path: 'visitor-list', loadComponent: () => import('./operation/visitor/visitor-list/visitor-list').then(m => m.VisitorList) },
  { path: 'vehicle-list', component: VehicleList }, // Giữ từ HEAD
  { path: 'fast-checkin', loadComponent: () => import('./operation/visitor/fast-checkin/fast-checkin').then(m => m.FastCheckin) },
  { path: 'profile', loadComponent: () => import('../common/profile/profile.component').then(m => m.ProfileComponent), title: 'Profile' },
  { path: 'manage-service', loadComponent: () => import('./operation/service-list.component/service-list.component').then(m => m.ServiceListComponent), title: 'Quản lý Dịch vụ' },
  { path: 'manage-utility', loadComponent: () => import('./operation/utility-list.component/utility-list.component').then(m => m.UtilityListComponent), title: 'Quản lý Tiện ích' },
  
  // Routes mới từ nhánh Son
  { path: 'meter-record', canActivate: [permissionGuard('meterreading.sheet.read')], loadComponent: () => import('./management/meter-recording-sheet/meter-recording-sheet.component').then(m => m.MeterRecordingSheetComponent), title: 'Nhập chỉ số điện nước' },
  { path: 'meter-reading-list', canActivate: [permissionGuard(['meterreading.record.read', 'meterreading.progress.read'])], loadComponent: () => import('./operation/meter-reading-list/meter-reading-list.component').then(m => m.MeterReadingListComponent), title: 'Danh sách chỉ số điện nước' },
  
  // --- END OPERATION  ---
  { path: '', redirectTo: 'manage-apartment', pathMatch: 'full' }
];