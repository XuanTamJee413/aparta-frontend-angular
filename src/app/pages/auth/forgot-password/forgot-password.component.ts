import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface ApiResponse {
  succeeded: boolean;
  message: string;
  data?: any;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const body = {
      email: this.form.value.email
    };

    this.http.post<ApiResponse>(`${environment.apiUrl}/auth/forgot-password`, body)
      .subscribe({
        next: (res) => {
          if (res.succeeded) {
            this.success.set(true);
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

