import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div class="svg-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300">
          <defs>
            <linearGradient id="grad403" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#ff7043;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f4511e;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="150" cy="150" r="90" stroke="url(#grad403)" stroke-width="20" fill="none"/>
          <line x1="100" y1="150" x2="200" y2="150" stroke="url(#grad403)" stroke-width="20" stroke-linecap="round"/>
          <rect x="260" y="90" width="150" height="120" rx="10" ry="10" fill="#f0f0f0" stroke="url(#grad403)" stroke-width="12"/>
          <circle cx="335" cy="150" r="28" fill="#f0f0f0" stroke="url(#grad403)" stroke-width="10"/>
          <line x1="315" y1="150" x2="355" y2="150" stroke="url(#grad403)" stroke-width="10" stroke-linecap="round"/>
        </svg>
      </div>

      <h1>Không đủ quyền truy cập</h1>
      <h3>403 Forbidden</h3>
      <p class="message">
        Bạn không có quyền để truy cập trang này. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị.
      </p>

      <button mat-flat-button color="primary" routerLink="/login">
        <mat-icon>login</mat-icon>
        Quay về trang chủ
      </button>
    </div>
  `,
  styles: [`
    .container { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; width:100%; background:#f8f9fa; text-align:center; padding:2rem; box-sizing:border-box; overflow:hidden; }
    .svg-container { width:100%; max-width:500px; margin-bottom:2rem; animation: float 4s ease-in-out infinite; }
    .svg-container svg { width:100%; height:auto; }
    h1 { font-size:2.3rem; font-weight:700; color:#f4511e; margin:0 0 1rem 0; }
    .message { font-size:1.1rem; color:#5f6368; line-height:1.6; max-width:600px; margin-bottom:2.5rem; }
    button[mat-flat-button] { padding:12px 32px; font-size:1rem; border-radius:28px; transform:scale(1); transition: transform .2s ease; }
    button[mat-flat-button]:hover { transform:scale(1.05); box-shadow:0 4px 15px rgba(244,81,30,.3); }
    @keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-15px)} 100%{transform:translateY(0)} }
  `]
})
export class Forbidden {}
