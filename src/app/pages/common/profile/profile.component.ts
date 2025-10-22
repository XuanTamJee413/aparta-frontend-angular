import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { cloudinaryConfig, cloudinaryUploadOptions } from '../../../config/cloudinary.config';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-common-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class CommonProfileComponent {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);

  loading = signal(true);
  error = signal<string | null>(null);
  profile = signal<{
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
    apartmentId?: string | null;
    staffCode?: string | null;
    status?: string | null;
    lastLoginAt?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  editing = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  readonly fb = inject(FormBuilder);
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: [{ value: '', disabled: true }],
    phone: ['', [Validators.required, Validators.maxLength(50)]],
    avatarUrl: [{ value: '', disabled: true }]
  });

  // Cloudinary config from config file
  private readonly CLOUDINARY_CLOUD_NAME = cloudinaryConfig.cloudName;
  private readonly CLOUDINARY_UPLOAD_PRESET = cloudinaryConfig.uploadPreset;

  constructor() {
    const baseUrl = (location.host.includes('localhost:4200') || location.hostname === 'localhost') ? '/api' : environment.apiUrl;
    
    // [ĐÃ SỬA]: SỬ DỤNG CHẮC CHẮN CACHE-BUSTER CHO LẦN GỌI ĐẦU TIÊN
    const nocacheUrl = `${baseUrl}/users/profile?_=${Date.now()}`; 
    
    this.http.get<any>(nocacheUrl).subscribe({
      next: (res) => {
        const payload = this.auth.user();
        const api = (res?.data ?? res?.user ?? res) as any;
        const email = (api?.email ?? api?.emailAddress ?? payload?.email) as string | undefined;
        const phone = (api?.phone ?? api?.phoneNumber ?? payload?.phone) as string | undefined;
        const roleRaw = (api?.role ?? api?.roleName ?? payload?.role) as string | undefined;
        const normalizedRole = String(roleRaw || '').trim().toLowerCase();
        const enriched = {
          id: (api?.userId ?? api?.id ?? payload?.id) as string | undefined,
          name: (api?.name ?? payload?.name) as string | undefined,
          phone,
          email,
          role: normalizedRole || undefined,
          apartmentId: (api?.apartmentId ?? null) as string | null,
          staffCode: (api?.staffCode ?? null) as string | null,
          status: (api?.status ?? null) as string | null,
          lastLoginAt: (api?.lastLoginAt ?? null) as string | null,
          avatarUrl: (api?.avatarUrl ?? null) as string | null
        };
        this.profile.set(enriched);
        this.loading.set(false);
        this.hydrateForm();
      },
      error: () => {
        // Try common fallback endpoints in order
        this.tryFallbackEndpoints(baseUrl);
      }
    });
  }

  private tryFallbackEndpoints(baseUrl: string): void {
    // [ĐÃ SỬA]: Thêm cache-buster cho tất cả các endpoint fallback
    const timestamp = Date.now();
    const fallbacks = [
        `${baseUrl}/users/profile?_=${timestamp}`, 
        `${baseUrl}/auth/me?_=${timestamp}`, 
        `${baseUrl}/profile/me?_=${timestamp}`
    ];
    
    const next = (i: number) => {
      if (i >= fallbacks.length) {
        this.useJwtFallback('Failed to load profile');
        return;
      }
      this.http.get<any>(fallbacks[i]).subscribe({ // SỬ DỤNG fallbacks[i] CÓ CHỐNG CACHE
        next: (res) => {
          const payload = this.auth.user();
          const api = (res?.data ?? res?.user ?? res) as any;
          const email = (api?.email ?? api?.emailAddress ?? payload?.email) as string | undefined;
          const phone = (api?.phone ?? api?.phoneNumber ?? payload?.phone) as string | undefined;
          const roleRaw = (api?.role ?? api?.roleName ?? payload?.role) as string | undefined;
          const normalizedRole = String(roleRaw || '').trim().toLowerCase();
          const enriched = {
            id: (api?.userId ?? api?.id ?? payload?.id) as string | undefined,
            name: (api?.name ?? payload?.name) as string | undefined,
            phone,
            email,
            role: normalizedRole || undefined,
            apartmentId: (api?.apartmentId ?? null) as string | null,
            staffCode: (api?.staffCode ?? null) as string | null,
            status: (api?.status ?? null) as string | null,
            lastLoginAt: (api?.lastLoginAt ?? null) as string | null,
            avatarUrl: (api?.avatarUrl ?? null) as string | null
          };
          this.profile.set(enriched);
          this.loading.set(false);
          this.hydrateForm();
        },
        error: () => next(i + 1)
      });
    };
    next(0);
  }

  private useJwtFallback(message: string): void {
    this.error.set(message);
    const payload = this.auth.user();
    if (payload) {
      const normalizedRole = String(payload.role || '').trim().toLowerCase();
      this.profile.set({
        id: payload.id as string | undefined,
        name: payload.name as string | undefined,
        phone: payload.phone as string | undefined,
        email: payload.email as string | undefined,
        role: (normalizedRole || undefined)
      });
    }
    this.loading.set(false);
  }

  initials(): string {
    const n = (this.profile()?.name || '').trim();
    if (!n) return 'U';
    const parts = n.split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase()).join('');
    return parts || n[0]?.toUpperCase() || 'U';
  }

  roleDisplay(): string {
    const fromJwt = (this.auth.user()?.role as unknown as string) ?? '';
    const fromApi = this.profile()?.role ?? '';
    const combined = fromJwt || fromApi; // prefer JWT to avoid API nulls
    if (!combined) return '—';
    return String(combined).trim().toLowerCase();
  }

  toggleEdit(): void {
    if (!this.editing()) {
      this.hydrateForm();
    }
    this.editing.update(v => !v);
  }

  private hydrateForm(): void {
    const p = this.profile();
    const fallback = this.auth.user();
    const emailValue = (p?.email ?? (fallback?.email as string)) || '';
    this.form.patchValue({
      name: (p?.name ?? (fallback?.name as string)) || '',
      email: emailValue,
      phone: (p?.phone ?? (fallback?.phone as string)) || '',
      avatarUrl: p?.avatarUrl || ''
    });
    // Force update disabled field
    this.form.get('email')?.setValue(emailValue);
  }

  // Helper để xử lý cập nhật profile thành công và chuẩn hóa dữ liệu trả về
  private handleSuccessfulUpdate(res: any, fallbackData: any): void {
      const api = (res?.data ?? res) as any;
      const updated = {
        ...this.profile(),
        name: api?.name ?? fallbackData.name ?? undefined,
        email: api?.email ?? fallbackData.email ?? undefined,
        phone: api?.phone ?? fallbackData.phone ?? undefined,
        // Chú ý: Backend có thể trả về 'avatarUrl' hoặc 'AvatarUrl'
        avatarUrl: api?.avatarUrl ?? api?.AvatarUrl ?? this.profile()?.avatarUrl ?? undefined
      };
      this.profile.set(updated);
      this.editing.set(false);
  }

  // Hàm chính để lưu profile
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    const baseUrl = (location.host.includes('localhost:4200') || location.hostname === 'localhost') ? '/api' : environment.apiUrl;

    // BƯỚC 1: Kích hoạt luồng upload có file nếu có file được chọn
    if (this.selectedFile()) {
      this.saveProfileWithImage(baseUrl);
      return;
    }

    // BƯỚC 2: Luồng mặc định: chỉ cập nhật thông tin text (Dùng endpoint POST/PATCH)
    const body = {
      name: this.form.value.name,
      phone: this.form.value.phone
    } as Record<string, unknown>;
    
    const updateEndpoints = [
      `${baseUrl}/User/update-profile`, 
      `${baseUrl}/users/update-profile`,
      `${baseUrl}/users/profile`,
      `${baseUrl}/auth/update-profile`,
      `${baseUrl}/profile/update`
    ];
    
    this.tryUpdateEndpoints(updateEndpoints, body, 0);
  }

  // HÀM MỚI: Xử lý lưu Profile kèm ảnh qua Backend API
  private saveProfileWithImage(baseUrl: string): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    const fd = new FormData();

    // Thêm các trường dữ liệu cần thiết (phải khớp với ProfileUpdateWithImageDto)
    if (this.form.value.name) { fd.append('Name', this.form.value.name); }
    if (this.form.value.phone) { fd.append('Phone', this.form.value.phone); }
    fd.append('AvatarImage', file, file.name); 

    const endpoint = `${baseUrl}/User/update-profile-with-image`;

    this.http.post<any>(endpoint, fd).subscribe({
      next: (res) => {
        const fallbackData = { name: this.form.value.name, phone: this.form.value.phone, email: this.profile()?.email };
        this.handleSuccessfulUpdate(res, fallbackData);

        // Reset trạng thái upload
        this.uploading.set(false);
        this.selectedFile.set(null);
        this.previewUrl.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Cập nhật hồ sơ kèm ảnh thất bại. Vui lòng thử lại.');
        this.uploading.set(false);
      }
    });
  }

  private tryUpdateEndpoints(endpoints: string[], body: any, index: number): void {
    if (index >= endpoints.length) {
      this.error.set('Failed to save profile - no working endpoint found');
      return;
    }
    
    const endpoint = endpoints[index];
    console.log(`Trying update endpoint: ${endpoint}`);
    
    this.http.patch<any>(endpoint, body).subscribe({
      next: (res) => {
        console.log(`Success with endpoint: ${endpoint}`, res);
        const api = (res?.data ?? res) as any;
        const updated = {
          ...this.profile(),
          name: api?.name ?? this.form.value.name ?? undefined,
          email: api?.email ?? this.profile()?.email ?? undefined,
          phone: api?.phone ?? this.form.value.phone ?? undefined,
          avatarUrl: api?.avatarUrl ?? this.profile()?.avatarUrl ?? undefined
        };
        this.profile.set(updated);
        this.editing.set(false);
      },
      error: (err) => {
        console.log(`Failed with endpoint: ${endpoint}`, err);
        this.tryUpdateEndpoints(endpoints, body, index + 1);
      }
    });
  }

  // Bỏ qua hàm uploadAvatar() cũ vì logic đã được chuyển sang save()
  uploadAvatar(): void {
    this.error.set('Vui lòng nhấn nút "Save" để lưu cả profile và avatar.');
    this.uploading.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = (input.files && input.files[0]) ? input.files[0] : null;
    this.selectedFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }
}