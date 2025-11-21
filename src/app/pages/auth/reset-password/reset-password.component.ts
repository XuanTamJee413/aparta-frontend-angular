import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
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
      
      if (tokenParam) {
        this.token.set(tokenParam);
      }
      if (emailParam) {
        this.email.set(decodeURIComponent(emailParam));
        this.form.patchValue({ email: decodeURIComponent(emailParam) });
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
    // Kiểm tra email từ query params hoặc form
    if (!this.email() && !this.form.value.email) {
      this.error.set('Email không hợp lệ. Vui lòng sử dụng link từ email.');
      return;
    }

    if (!this.token()) {
      this.error.set('Token không hợp lệ. Vui lòng sử dụng link từ email.');
      return;
    }

    if (this.form.get('newPassword')?.invalid || this.form.get('confirmPassword')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

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

