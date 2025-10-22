import { Injectable, computed, signal } from '@angular/core';

type UserRole = 'admin' | 'staff' | 'resident';

interface JwtPayload {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: UserRole | string;
  role_id?: string;
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

  hasRole(expected: UserRole | UserRole[]): boolean {
    const payload = this.user();
    if (!payload || !payload.role) return false;
    const roles = Array.isArray(expected) ? expected : [expected];
    const normalized = String(payload.role).trim().toLowerCase();
    return roles.map(r => r.toLowerCase()).includes(normalized as UserRole);
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
    if (!payload || !payload.exp) return true; // assume valid if no exp
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowSeconds;
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


