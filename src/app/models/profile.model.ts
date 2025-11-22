export interface UserProfileDto {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string | null;
  role: string;
  apartmentInfo?: string | null;
  managedBuildingNames: string[];
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileDto {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data?: T;
}

