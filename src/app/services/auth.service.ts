import { Injectable, computed, signal } from '@angular/core';

type UserRole = 'admin' | 'staff' | 'resident' | 'custom';

// Backend response wrapper
export interface ApiResponse<T = any> {
  succeeded: boolean;
  message: string;
  data?: T;
}

// Login response data
export interface LoginResponse {
  token: string;
  isFirstLogin: boolean;
}

// User info response from /auth/me
export interface UserInfoResponse {
  userId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  apartmentId?: string | null;
  staffCode?: string | null;
  status: string;
  lastLoginAt?: string | null;
}

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
  private userPermissions: string[] = [];

  readonly token = computed(() => this.tokenSig());
  readonly user = computed<JwtPayload | null>(() => this.decodeToken(this.tokenSig()));
  readonly isAuthenticated = computed(() => this.isTokenValid(this.tokenSig()));

  constructor() {
    // Listen for localStorage changes from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.storageKey) {
          // Token was changed/removed in another tab
          const newToken = event.newValue;
          this.tokenSig.set(newToken);
          
          if (newToken) {
            const payload = this.decodeToken(newToken);
            this.extractPermissionsFromPayload(payload);
          } else {
            this.userPermissions = [];
          }
        }
      });

      // Periodically check if token still exists in localStorage
      setInterval(() => {
        const currentInMemory = this.tokenSig();
        const currentInStorage = localStorage.getItem(this.storageKey);
        
        // If token was removed from storage but still in memory
        if (currentInMemory && !currentInStorage) {
          this.tokenSig.set(null);
          this.userPermissions = [];
        }
        // If token in storage doesn't match memory
        else if (currentInStorage !== currentInMemory) {
          this.tokenSig.set(currentInStorage);
          if (currentInStorage) {
            const payload = this.decodeToken(currentInStorage);
            this.extractPermissionsFromPayload(payload);
          } else {
            this.userPermissions = [];
          }
        }
      }, 1000); // Check every second
    }
  }

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.storageKey, token);
      this.tokenSig.set(token);

      const payload = this.decodeToken(token);
      this.extractPermissionsFromPayload(payload);
    } else {
      localStorage.removeItem(this.storageKey);
      this.tokenSig.set(null);
      this.userPermissions = [];
    }
  }

  getToken(): string | null {
    return this.tokenSig();
  }

  private normalizeRole(role: unknown): UserRole | null {
    const r = String(role ?? '').trim().toLowerCase();
    if (!r) return null;

    if (r === 'admin') return 'admin';
    if (['owner', 'tenant', 'family_member', 'resident'].includes(r)) {
      return 'resident';
    }

    if (r === 'manager') return 'staff';

    if (['finance_staff', 'maintenance_staff', 'operation_staff', 'staff'].includes(r)) {
      return 'staff';
    }

    return 'custom';
  }

  hasRole(expected: UserRole | UserRole[]): boolean {
    const payload = this.user();
    if (!payload || !payload.role) return false;

    const normalized = this.normalizeRole(payload.role);
    if (!normalized) return false;

    const roles = Array.isArray(expected) ? expected : [expected];
    const expectedSet = roles.map(r => r.toLowerCase());

    return expectedSet.includes(normalized as UserRole);
  }

  hasPermission(requiredPermission: string): boolean {
    const payload = this.user();
    if (!payload) return false;

    const normalized = this.normalizeRole(payload.role);
    // Only admin has full permission bypass
    if (normalized === 'admin') {
      return true;
    }

    // For custom/manager and staff, check actual permissions
    if (this.userPermissions.length > 0) {
      return this.userPermissions.includes(requiredPermission);
    }

    const perm = payload.permission;
    if (!perm) return false;

    if (Array.isArray(perm)) {
      return perm.includes(requiredPermission);
    }

    if (typeof perm === 'string') {
      return perm === requiredPermission;
    }

    return false;
  }

  logout(): void {
    this.setToken(null);
    this.userPermissions = [];
  }

  private readToken(): string | null {
    try {
      const token = localStorage.getItem(this.storageKey);
      if (token) {
        const payload = this.decodeToken(token);
        this.extractPermissionsFromPayload(payload);
      }
      return token;
    } catch {
      return null;
    }
  }

  private extractPermissionsFromPayload(payload: JwtPayload | null): void {
    if (!payload || !payload.permission) {
      this.userPermissions = [];
      return;
    }

    if (Array.isArray(payload.permission)) {
      this.userPermissions = [...payload.permission];
    } else if (typeof payload.permission === 'string') {
      this.userPermissions = [payload.permission];
    } else {
      this.userPermissions = [];
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

    return true;
  }

  private decodeToken(token: string | null): JwtPayload | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}
