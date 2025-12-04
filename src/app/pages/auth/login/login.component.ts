import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
    phone: ['', [Validators.required, Validators.pattern(/^\d{9,11}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const body = {
      phone: this.form.value.phone,
      password: this.form.value.password
    };
    this.http.post<any>(`${environment.apiUrl}/auth/login`, body)
      .subscribe({
        next: (res) => {
          const token: string | undefined = (res && (res.token || res.Token)) as string | undefined;
          if (!token) {
            // Backend succeeded but no token field as expected
            this.error.set('Login response missing token');
            this.submitting.set(false);
            return;
          }
          this.auth.setToken(token);
          
          // Kiểm tra isFirstLogin từ response
          const isFirstLogin = res?.isFirstLogin || res?.IsFirstLogin || false;
          if (isFirstLogin) {
            // Redirect đến reset-password cho first login
            this.router.navigateByUrl('/reset-password?firstLogin=true');
          } else {
            this.navigateByRole();
          }
          this.submitting.set(false);
        },
        error: (err) => {
          const backend = err?.error;
          let message = 'Login failed';
          if (typeof backend === 'string') {
            message = backend;
          } else if (backend?.message) {
            message = backend.message;
          } else if (err?.statusText) {
            message = err.statusText;
          }
          this.error.set(message);
          this.submitting.set(false);
        }
      });
  }

  private navigateByRole(): void {
    if (this.auth.hasRole('custom')) {
      this.router.navigateByUrl('/manager/dashboard');
      return;
    }
    if (this.auth.hasRole('admin')) {
      this.router.navigateByUrl('/admin');
      return;
    }
    if (this.auth.hasRole('resident')) {
      this.router.navigateByUrl('/home');
      return;
    }
    if (this.auth.hasRole('staff')) {
      this.router.navigateByUrl('/manager/dashboard');
      return;
    }
    // Missing/unknown role
    this.router.navigateByUrl('/not-found');
  }
}

