import { Injectable, computed, signal } from '@angular/core';

type UserRole = 'admin' | 'staff' | 'resident' | 'custom';

interface JwtPayload {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: UserRole | string;
  role_id?: string;
  apartment_id?: string;
  permission?: string | string[];
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_token';
  private readonly tokenSig = signal<string | null>(this.readToken());

  readonly token = computed(() => this.tokenSig());
  readonly user = computed<JwtPayload | null>(() => this.decodeToken(this.tokenSig()));
  readonly isAuthenticated = computed(() => this.isTokenValid(this.tokenSig()));

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.storageKey, token);
      this.tokenSig.set(token);
    } else {
      localStorage.removeItem(this.storageKey);
      this.tokenSig.set(null);
    }
  }

  getToken(): string | null {
    return this.tokenSig();
  }

  private normalizeRole(role: unknown): UserRole | null {
    const r = String(role ?? '').trim().toLowerCase();
    if (!r) return null;
    if (r === 'admin') return 'admin';
    if (r === 'resident') return 'resident';
    if (['manager', 'finance_staff', 'maintenance_staff', 'operation_staff'].includes(r)) return 'staff';
    return 'custom';
  }

  hasRole(expected: UserRole | UserRole[]): boolean {
    const payload = this.user();
    if (!payload || !payload.role) return false;
    const roles = Array.isArray(expected) ? expected : [expected];
    const normalized = this.normalizeRole(payload.role);
    if (!normalized) return false;
    const expectedSet = roles.map(r => r.toLowerCase());
    if (normalized === 'custom' && expectedSet.includes('admin')) {
      return true;
    }
    return expectedSet.includes(normalized as UserRole);
  }

  // Map permission format from backend policy to token format
  private mapPermissionToTokenFormat(policyName: string): string[] {
    const mappings: { [key: string]: string[] } = {
      'CanReadNews': ['news.read', 'CanReadNews'],
      'CanCreateNews': ['news.create', 'CanCreateNews'],
      'CanUpdateNews': ['news.update', 'CanUpdateNews'],
      'CanDeleteNews': ['news.delete', 'CanDeleteNews'],
      'CanReadApartment': ['apartment.read', 'CanReadApartment'],
      'CanCreateApartment': ['apartment.create', 'CanCreateApartment'],
      'CanUpdateApartment': ['apartment.update', 'CanUpdateApartment'],
      'CanDeleteApartment': ['apartment.delete', 'CanDeleteApartment'],
      'CanReadMeterReadingSheet': ['meter.reading.sheet', 'CanReadMeterReadingSheet'],
      'CanCreateMeterReading': ['meter.reading.create', 'CanCreateMeterReading'],
      'CanReadMeterReadingProgress': ['meter.reading.progress', 'CanReadMeterReadingProgress'],
      'CanReadMeterReadingRecord': ['meter.reading.record', 'CanReadMeterReadingRecord'],
      'CanReadMeterReadingHistory': ['meter.reading.history', 'CanReadMeterReadingHistory'],
      'CanReadInvoiceResident': ['invoice.resident.read', 'CanReadInvoiceResident'],
      'CanReadInvoiceStaff': ['invoice.staff.read', 'CanReadInvoiceStaff'],
      'CanCreateInvoicePayment': ['invoice.payment.create', 'CanCreateInvoicePayment']
    };

    // If exact match exists, return mapped values
    if (mappings[policyName]) {
      return mappings[policyName];
    }

    // Return original policy name as well
    return [policyName];
  }

  // Check if current user has a specific permission (from JWT payload)
  hasPermission(requiredPermission: string): boolean {
    const payload = this.user();
    if (!payload) {
      return false;
    }

    // Admin/custom bypass: có mọi quyền
    if (payload.role && ['admin','custom'].includes(String(payload.role).trim().toLowerCase())) {
      return true;
    }

    // Try multiple field names for permissions (permission, permissions, Permission, Permissions)
    let permissions: string | string[] | undefined = payload.permission;
    if (!permissions && (payload as any).permissions) {
      permissions = (payload as any).permissions;
    }
    if (!permissions && (payload as any).Permission) {
      permissions = (payload as any).Permission;
    }
    if (!permissions && (payload as any).Permissions) {
      permissions = (payload as any).Permissions;
    }

    if (!permissions) {
      return false;
    }

    // Normalize permission comparison (case-insensitive)
    const normalizedRequired = requiredPermission.trim();
    const permissionsArray: string[] = Array.isArray(permissions) 
      ? permissions.map(p => String(p).trim())
      : [String(permissions).trim()];

    // Map policy name to possible token permission formats
    const allowedPermissions = this.mapPermissionToTokenFormat(normalizedRequired);
    
    // Check if any of the mapped permissions exist in user's permissions
    return allowedPermissions.some(allowed => 
      permissionsArray.some(userPerm => 
        userPerm === allowed || 
        userPerm.toLowerCase() === allowed.toLowerCase()
      )
    );
  }

  logout(): void {
    this.setToken(null);
  }

  private readToken(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const payload = this.decodeToken(token);
    if (!payload) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number') {
      return payload.exp > nowSeconds;
    }
    // If no exp claim, consider it valid but only if payload exists
    return true;
  }

  private decodeToken(token: string | null): JwtPayload | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}


