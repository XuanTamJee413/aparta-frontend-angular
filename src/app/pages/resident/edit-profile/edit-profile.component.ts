import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-edit-profile', 
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="page-container"> <div class="page-header">
        <button class="back-button" (click)="onCancel()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <div>
          <h2>Edit Profile</h2>
          <p class="subtitle">Update your personal information</p>
        </div>
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="onSave()" class="profile-form">
        
        <section class="card">
          <h3 class="card-title">Personal Information</h3>
          <p class="card-subtitle">Update your contact details</p>
          
          <div class="form-grid">
            <div class="form-field">
              <label for="fullName">Full Name</label>
              <div class="input-wrapper">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                <input id="fullName" type="text" formControlName="fullName" placeholder="Your full name">
              </div>
            </div>

            <div class="form-field">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <input id="email" type="email" formControlName="email" placeholder="your.email@example.com">
              </div>
            </div>

            <div class="form-field">
              <label for="phone">Phone Number</label>
              <div class="input-wrapper">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C6.92 18 2 13.08 2 7V3z" />
                </svg>
                <input id="phone" type="tel" formControlName="phone" placeholder="+1 (555) 000-0000">
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <h3 class="card-title">Apartment Information</h3>
          <p class="card-subtitle">Your residence details</p>
          
          <div class="form-grid">
            <div class="form-field">
              <label for="apartmentNumber">Apartment Number</label>
              <div class="input-wrapper">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4H6v12a1 1 0 11-2 0V4zm4 4a1 1 0 100 2h4a1 1 0 100-2H8zm0 4a1 1 0 100 2h4a1 1 0 100-2H8z" clip-rule="evenodd" />
                </svg>
                <input id="apartmentNumber" type="text" formControlName="apartmentNumber">
              </div>
              <small class="field-helper">Contact management to change apartment</small>
            </div>

            <div class="form-field">
              <label for="emergencyContact">Emergency Contact</label>
              <div class="input-wrapper">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C6.92 18 2 13.08 2 7V3z" />
                </svg>
                <input id="emergencyContact" type="tel" formControlName="emergencyContact" placeholder="+1 (555) 000-0000">
              </div>
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid">Save Changes</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .page-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .page-header h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    .page-header .subtitle { 
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0.25rem 0 0 0;
    }
    .back-button {
      background: #fff;
      border: 1px solid #e9ecef; 
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #495057;
      transition: background-color 0.2s;
    }
    .back-button:hover {
      background-color: #f8f9fa;
    }
    .back-button svg {
      width: 20px;
      height: 20px;
    }

    .profile-form {
    }

    .card {
      background-color: #fff;
      border: 1px solid #e9ecef; 
      border-radius: 8px;
      padding: 1.5rem 2rem;
      margin-top: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      color: #212529;
    }
    .card-subtitle {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0.25rem 0 1.5rem 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .form-field {
      display: flex;
      flex-direction: column;
    }
    .form-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #343a40;
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrapper .icon {
      position: absolute;
      left: 12px;
      width: 20px;
      height: 20px;
      color: #adb5bd;
      pointer-events: none;
    }
    .input-wrapper input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem; 
      font-size: 0.95rem;
      border: 1px solid #ced4da;
      border-radius: 8px;
      background-color: #f8f9fa;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-wrapper input:focus {
      outline: none;
      border-color: #0d6efd;
      background-color: #fff;
      box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
    }
    .input-wrapper input:disabled,
    input[readonly] {
      background-color: #e9ecef;
      cursor: not-allowed;
    }
    .field-helper {
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 0.25rem;
    }

    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s, border-color 0.2s;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }
    .btn-primary:hover {
      background-color: #0b5ed7;
    }
    .btn-primary:disabled {
      background-color: #a0c7ff;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background-color: #fff;
      color: #495057;
      border: 1px solid #ced4da;
    }
    .btn-secondary:hover {
      background-color: #f8f9fa;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr; 
      }
      .page-header {
        align-items: flex-start;
      }
      .card {
        padding: 1.5rem;
      }
      .form-actions {
        flex-direction: column;
      }
      .btn {
        width: 100%; 
      }
    }
  `]
})
export class EditProfileComponent implements OnInit {
  
  profileForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['John Anderson', Validators.required],
      email: ['john.anderson@email.com', [Validators.required, Validators.email]],
      phone: ['+1 (555) 123-4567'],
      
      apartmentNumber: [{ value: 'A-201', disabled: true }], 
      emergencyContact: ['+1 (555) 987-6543']
    });
  }

  onSave() {
    if (this.profileForm.valid) {
      console.log('Đang lưu hồ sơ:', this.profileForm.getRawValue());
    }
  }

  onCancel() {
    console.log('Đã hủy chỉnh sửa');
  }
}