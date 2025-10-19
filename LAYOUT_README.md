# AdminKit Angular Layout

Đây là layout system được xây dựng dựa trên AdminKit template cho ứng dụng Angular.

## Cấu trúc Layout

### `/src/app/layout/`
- `main-layout.component.ts` - Component chính chứa header, sidebar, footer và router-outlet
- `header.component.ts` - Header với navbar, search, notifications, user menu
- `sidebar.component.ts` - Sidebar với navigation menu
- `footer.component.ts` - Footer với thông tin copyright và links

### `/src/app/pages/admin/`
- `admin-layout.component.ts` - Layout wrapper cho các trang admin
- `admin.routes.ts` - Routes cho admin section
- `dashboard.component.ts` - Dashboard chính
- `settings.component.ts` - Trang settings
- `profile.component.ts` - Trang profile

### `/src/app/pages/admin/project/`
- `project.routes.ts` - Routes cho project management
- `project-list.component.ts` - Danh sách projects
- `project-create.component.ts` - Tạo project mới
- `project-edit.component.ts` - Chỉnh sửa project
- `project-detail.component.ts` - Chi tiết project
- `project-categories.component.ts` - Quản lý categories
- `project-reports.component.ts` - Báo cáo projects

## Routing

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/settings` - Settings
- `/admin/profile` - Profile

### Project Routes
- `/admin/project/list` - Danh sách projects
- `/admin/project/create` - Tạo project mới
- `/admin/project/edit/:id` - Chỉnh sửa project
- `/admin/project/detail/:id` - Chi tiết project
- `/admin/project/categories` - Quản lý categories
- `/admin/project/reports` - Báo cáo

## Sử dụng

Layout được thiết kế theo kiến trúc standalone components của Angular 17+. Mỗi component đều là standalone và có thể import trực tiếp mà không cần NgModule.

### Ví dụ sử dụng MainLayout:
```typescript
import { MainLayoutComponent } from './layout/main-layout.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [MainLayoutComponent],
  template: `
    <app-main-layout>
      <!-- Nội dung của bạn -->
    </app-main-layout>
  `
})
export class ExampleComponent {}
```

## CSS

Layout sử dụng Bootstrap 5 classes và AdminKit CSS. Đảm bảo đã import CSS của AdminKit vào `styles.css`:

```css
@import url('path/to/adminkit/css/light.css');
```

## Tính năng

- ✅ Responsive design
- ✅ Sidebar có thể collapse
- ✅ Header với search và notifications
- ✅ Footer với links
- ✅ Routing cho admin và project management
- ✅ Standalone components
- ✅ TypeScript support
