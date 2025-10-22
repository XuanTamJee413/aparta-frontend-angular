import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    phone: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set(null);
    const body = {
      phone: this.form.value.phone,
      password: this.form.value.password
    };
    const baseUrl = (location.host.includes('localhost:4200') || location.hostname === 'localhost') ? '/api' : environment.apiUrl;
    this.http.post<{ token: string }>(`${baseUrl}/auth/login`, body)
      .subscribe({
        next: (res) => {
          this.auth.setToken(res.token);
          this.navigateByRole();
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Login failed');
          this.submitting.set(false);
        }
      });
  }

  loginDemo(role: 'admin' | 'staff' | 'resident'): void {
    const token = this.createUnsignedJwt({
      id: 'demo', name: 'Demo User', email: 'demo@example.com', role, exp: Math.floor(Date.now()/1000) + 60 * 60 * 4,
      iss: 'ApartaAPI', aud: 'ApartaAPI'
    });
    this.auth.setToken(token);
    this.navigateByRole();
  }

  private navigateByRole(): void {
    const payload = this.auth.user();
    const role = String(payload?.role || '').trim().toLowerCase();
    if (role === 'admin') {
      this.router.navigateByUrl('/admin/dashboard');
    } else if (role === 'staff') {
      this.router.navigateByUrl('/management');
    } else {
      this.router.navigateByUrl('/resident/home');
    }
  }

  private createUnsignedJwt(payload: Record<string, unknown>): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const base64url = (obj: unknown) => {
      const json = JSON.stringify(obj);
      const b = btoa(unescape(encodeURIComponent(json)));
      return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };
    return `${base64url(header)}.${base64url(payload)}.demo-signature`;
  }
}


 