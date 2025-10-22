import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-not-found',
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
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#3f51b5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#00796b;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path fill="#f0f0f0" d="M 100,250 L 100,50 L 50,100 L 180,100 L 180,50 L 230,50 L 230,250 Z" />
          <circle cx="290" cy="150" r="80" stroke="url(#grad1)" stroke-width="20" fill="none"/>
          <line x1="350" y1="210" x2="420" y2="280" stroke="url(#grad1)" stroke-width="25" stroke-linecap="round"/>
          <path fill="#f0f0f0" d="M 450,250 L 450,50 L 400,100 L 530,100 L 530,50 L 580,50 L 580,250 Z" />
        </svg>
      </div>

      <h1>Ối! Đã có lỗi xảy ra.</h1>
      <h3>404 Not Found.</h3>
      <p class="message">
        Chúng tôi không thể tìm thấy trang bạn yêu cầu. <br/>
        Có vẻ như đường dẫn đã bị sai hoặc trang đã được di chuyển.
      </p>
      
      <button mat-flat-button color="primary" routerLink="/">
        <mat-icon>home</mat-icon>
        Quay về trang chủ
      </button>

    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center; 
      justify-content: center; 
      height: 100vh;
      width: 100%;
      background-color: #f8f9fa; 
      text-align: center;
      padding: 2rem;
      box-sizing: border-box;
      overflow: hidden;
    }

    .svg-container {
      width: 100%;
      max-width: 500px; 
      margin-bottom: 2rem;
      animation: float 4s ease-in-out infinite; 
    }

    .svg-container svg {
      width: 100%;
      height: auto;
    }

    h1 {
      font-size: 2.5rem; 
      font-weight: 700;
      color: #3f51b5; 
      margin: 0 0 1rem 0;
    }

    .message {
      font-size: 1.1rem; 
      color: #5f6368;
      line-height: 1.6;
      max-width: 600px;
      margin-bottom: 2.5rem; 
    }

    button[mat-flat-button] {
      padding: 12px 32px;
      font-size: 1rem;
      border-radius: 28px; 
      transform: scale(1);
      transition: transform 0.2s ease;
    }

    button[mat-flat-button]:hover {
      transform: scale(1.05); 
      box-shadow: 0 4px 15px rgba(63, 81, 181, 0.3);
    }

    @keyframes float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-15px);
      }
      100% {
        transform: translateY(0px);
      }
    }
  `]
})
export class NotFound {

  constructor() { }

}

