import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { UserProfileDto, ChangePasswordDto, UpdateProfileDto } from '../../../models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('passwordForm') passwordForm!: NgForm;
  @ViewChild('profileForm') profileForm!: NgForm;

  profile: UserProfileDto | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Avatar upload
  uploadingAvatar = false;
  avatarUploadError = '';
  readonly defaultAvatarUrl = '/img/avatars/avatar.jpg';

  // Edit profile (for admin)
  showEditProfile = false;
  updatingProfile = false;
  profileError = '';
  profileEditDto: UpdateProfileDto = {
    fullName: '',
    email: '',
    phoneNumber: ''
  };

  // Change password
  showChangePassword = false;
  changingPassword = false;
  passwordError = '';
  passwordDto: ChangePasswordDto = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileService.getProfile().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.profile = response.data;
        } else {
          this.errorMessage = response.message || 'Không thể tải thông tin profile.';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Đã xảy ra lỗi khi tải thông tin profile.';
        this.loading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.avatarUploadError = '';
    this.uploadingAvatar = true;

    this.profileService.updateAvatar(file).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          if (this.profile) {
            this.profile.avatarUrl = response.data;
          }
          this.successMessage = 'Cập nhật ảnh đại diện thành công.';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.avatarUploadError = response.message || 'Upload ảnh thất bại.';
        }
        this.uploadingAvatar = false;
        input.value = '';
      },
      error: (error) => {
        console.error('Error uploading avatar:', error);
        this.avatarUploadError = error.error?.message || 'Upload ảnh thất bại, vui lòng thử lại.';
        this.uploadingAvatar = false;
        input.value = '';
      }
    });
  }

  toggleChangePassword(): void {
    this.showChangePassword = !this.showChangePassword;
    if (!this.showChangePassword) {
      this.passwordDto = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.passwordError = '';
      if (this.passwordForm) {
        this.passwordForm.resetForm();
    }
    }
  }

  onChangePassword(form: NgForm): void {
    if (this.changingPassword || form.invalid) {
      if (form.invalid) {
        this.passwordError = 'Vui lòng kiểm tra lại các trường thông tin.';
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
      return;
    }

    this.changingPassword = true;
    this.passwordError = '';
    this.successMessage = '';

    this.profileService.changePassword(this.passwordDto).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.successMessage = response.message || 'Đổi mật khẩu thành công.';
          this.toggleChangePassword();
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.passwordError = response.message || 'Đổi mật khẩu thất bại.';
        }
        this.changingPassword = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.passwordError = error.error?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.';
        this.changingPassword = false;
    }
    });
  }

  getAvatarUrl(): string {
    return this.profile?.avatarUrl || this.defaultAvatarUrl;
  }

  getRoleDisplayName(): string {
    if (!this.profile?.role) return 'N/A';
    const role = this.profile.role.toLowerCase();
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'manager') return 'Quản lý';
    if (role === 'finance_staff') return 'Nhân viên Kế toán';
    if (role === 'security_staff') return 'Nhân viên Bảo vệ';
    if (role === 'operation_staff') return 'Nhân viên Vận hành';
    if (role === 'maintenance_staff') return 'Nhân viên Bảo trì';
    
    if (role === 'resident') {
      const context = this.profile.contextRole?.toLowerCase();
      if (context === 'owner') return 'Cư dân (Chủ sở hữu)';
      if (context === 'tenant') return 'Cư dân (Người thuê)';
      if (context === 'family_member') return 'Cư dân (Người nhà)';
      return 'Cư dân';
    }

    return this.profile.role;
  }

  isAdmin(): boolean {
    return this.profile?.role?.toLowerCase() === 'admin';
    }

  toggleEditProfile(): void {
    this.showEditProfile = !this.showEditProfile;
    if (this.showEditProfile && this.profile) {
      // Khởi tạo form với dữ liệu hiện tại
      this.profileEditDto = {
        fullName: this.profile.fullName,
        email: this.profile.email,
        phoneNumber: this.profile.phoneNumber
      };
    } else {
      this.profileError = '';
      if (this.profileForm) {
        this.profileForm.resetForm();
      }
    }
  }

  onUpdateProfile(form: NgForm): void {
    if (this.updatingProfile || form.invalid) {
      if (form.invalid) {
        this.profileError = 'Vui lòng kiểm tra lại các trường thông tin.';
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
    }
      return;
    }

    this.updatingProfile = true;
    this.profileError = '';
    this.successMessage = '';

    this.profileService.updateProfile(this.profileEditDto).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.profile = response.data;
          this.successMessage = response.message || 'Cập nhật thông tin thành công.';
          this.toggleEditProfile();
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.profileError = response.message || 'Cập nhật thông tin thất bại.';
        }
        this.updatingProfile = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.profileError = error.error?.message || 'Đã xảy ra lỗi khi cập nhật thông tin.';
        this.updatingProfile = false;
      }
    });
}
}
