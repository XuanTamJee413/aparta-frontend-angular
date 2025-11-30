import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface ApiResponse {
  succeeded: boolean;
  message: string;
  data?: any;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  token = signal<string | null>(null);
  email = signal<string | null>(null);
  isFirstLogin = signal(false);
  private readonly auth = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]], // Hidden field, lấy từ query params
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  ngOnInit(): void {
    // Lấy token và email từ query params
    this.route.queryParams.subscribe(params => {
      const tokenParam = params['token'];
      const emailParam = params['email'];
      const firstLoginParam = params['firstLogin'];
      
      if (firstLoginParam === 'true') {
        // First login flow: lấy email từ JWT token
        this.isFirstLogin.set(true);
        const user = this.auth.user();
        if (user?.email) {
          this.email.set(user.email);
          this.form.patchValue({ email: user.email });
        }
      } else {
        // Forgot password flow: lấy từ query params
        if (tokenParam) {
          this.token.set(tokenParam);
        }
        if (emailParam) {
          this.email.set(decodeURIComponent(emailParam));
          this.form.patchValue({ email: decodeURIComponent(emailParam) });
        }
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.get('newPassword')?.invalid || this.form.get('confirmPassword')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    if (this.isFirstLogin()) {
      // First login flow: gọi API reset-password với JWT token
      const body = {
        newPassword: this.form.value.newPassword!,
        confirmPassword: this.form.value.confirmPassword!,
        token: '', // Không cần token cho first login
        email: this.email() || this.form.value.email || ''
      };

      const token = this.auth.getToken();
      if (!token) {
        this.error.set('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        this.submitting.set(false);
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Gọi API reset-password với JWT token (backend sẽ nhận biết first login flow)
      this.http.post<ApiResponse>(`${environment.apiUrl}/auth/reset-password`, body, { headers })
        .subscribe({
          next: (res) => {
            if (res.succeeded) {
              this.success.set(true);
              // Redirect về trang đúng theo role sau 1.5 giây
              setTimeout(() => {
                this.navigateByRole();
              }, 1500);
            } else {
              this.error.set(res.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }
            this.submitting.set(false);
          },
          error: (err) => {
            const backend = err?.error;
            let message = 'Có lỗi xảy ra. Vui lòng thử lại.';
            if (backend?.message) {
              message = backend.message;
            } else if (typeof backend === 'string') {
              message = backend;
            }
            this.error.set(message);
            this.submitting.set(false);
          }
        });
    } else {
      // Forgot password flow: gọi API reset-password với token và email
      if (!this.email() && !this.form.value.email) {
        this.error.set('Email không hợp lệ. Vui lòng sử dụng link từ email.');
        this.submitting.set(false);
        return;
      }

      if (!this.token()) {
        this.error.set('Token không hợp lệ. Vui lòng sử dụng link từ email.');
        this.submitting.set(false);
        return;
      }

      const body = {
        token: this.token()!,
        email: this.email() || this.form.value.email!,
        newPassword: this.form.value.newPassword!,
        confirmPassword: this.form.value.confirmPassword!
      };

      this.http.post<ApiResponse>(`${environment.apiUrl}/auth/reset-password`, body)
        .subscribe({
          next: (res) => {
            if (res.succeeded) {
              this.success.set(true);
              // Redirect to login after 3 seconds
              setTimeout(() => {
                this.router.navigate(['/auth/login']);
              }, 3000);
            } else {
              this.error.set(res.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }
            this.submitting.set(false);
          },
          error: (err) => {
            const backend = err?.error;
            let message = 'Có lỗi xảy ra. Vui lòng thử lại.';
            if (backend?.message) {
              message = backend.message;
            } else if (typeof backend === 'string') {
              message = backend;
            }
            this.error.set(message);
            this.submitting.set(false);
          }
        });
    }
  }

  private navigateByRole(): void {
    if (this.auth.hasRole('custom')) {
      this.router.navigateByUrl('/manager/manage-apartment');
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
      this.router.navigateByUrl('/manager/manage-apartment');
      return;
    }
    // Default to login
    this.router.navigate(['/auth/login']);
  }
}

