import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ResidentManagementService,
  ApartmentMember,
  ApartmentMemberUpdateDto
} from '../../../../../services/management/resident-management.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resident-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './resident-detail.component.html',
  styleUrls: ['./resident-detail.component.css']
})
export class ResidentDetail implements OnInit {
  member: ApartmentMember | null = null;
  apartmentCode: string | null = null;
  isLoading = true;
  error: string | null = null;

  isEditing = false;
  isSaving = false;
  saveError: string | null = null;
  saveSuccess: string | null = null;
  isChangingAvatar = false;
  avatarError: string | null = null;
  avatarSuccess: string | null = null;

  editModel: {
    name: string;
    phoneNumber: string;
    idNumber: string;
    dateOfBirth: string;
    gender: string;
    status: string;
    nationality: string;
    familyRole: string;
  } = {
    name: '',
    phoneNumber: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    status: '',
    nationality: '',
    familyRole: ''
  };

  constructor(
    private route: ActivatedRoute,
    private residentService: ResidentManagementService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Không tìm thấy ID của cư dân.';
      this.isLoading = false;
      return;
    }

    this.loadMember(id);
  }

  loadMember(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.residentService.getMemberById(id).subscribe({
      next: (memberData: ApartmentMember) => {
        this.member = memberData;

        const aptId = memberData.apartmentId;
        if (aptId) {
          this.residentService.getApartmentById(aptId).subscribe({
            next: (apt) => (this.apartmentCode = apt?.code ?? null),
            error: (e) => {
              console.error('Lỗi lấy Apartment Code:', e);
              this.apartmentCode = null;
            }
          });
        }

        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error =
          err.status === 404
            ? 'Không tìm thấy thông tin cư dân.'
            : 'Không thể tải được dữ liệu. Vui lòng thử lại sau.';
        console.error('Lỗi khi gọi API chi tiết:', err);
        this.isLoading = false;
      }
    });
  }
    onAvatarFileSelected(event: Event): void {
    if (!this.member) return;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.isChangingAvatar = true;
    this.avatarError = null;
    this.avatarSuccess = null;

    this.residentService
      .updateMemberAvatar(this.member.apartmentMemberId, file)
      .subscribe({
        next: (res) => {
          this.isChangingAvatar = false;

          const newUrl = (res && res.data) ? res.data : this.member!.faceImageUrl;
          this.member = {
            ...this.member!,
            faceImageUrl: newUrl,
            updatedAt: new Date().toISOString()
          };

          this.avatarSuccess = 'Đổi ảnh thành công.';
          this.avatarError = null;

          input.value = '';
        },
        error: (err) => {
          console.error('Lỗi đổi ảnh thành viên:', err);
          this.isChangingAvatar = false;
          input.value = '';

          if (err.error?.message) {
            this.avatarError = err.error.message;
          } else {
            this.avatarError = 'Đổi ảnh thất bại. Vui lòng thử lại.';
          }
          this.avatarSuccess = null;
        }
      });
  }


  startEdit(): void {
    if (!this.member) return;

    this.saveError = null;
    this.saveSuccess = null;
    this.isEditing = true;

    this.editModel.name = this.member.name ?? '';
    this.editModel.phoneNumber = this.member.phoneNumber ?? '';
    this.editModel.idNumber = this.member.idNumber ?? '';
    this.editModel.gender = this.member.gender ?? '';
    this.editModel.status = this.member.status ?? '';
    this.editModel.nationality = this.member.nationality ?? '';
    this.editModel.familyRole = this.member.familyRole ?? '';

    if (this.member.dateOfBirth) {
      const d = new Date(this.member.dateOfBirth);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      this.editModel.dateOfBirth = `${yyyy}-${mm}-${dd}`;
    } else {
      this.editModel.dateOfBirth = '';
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.saveError = null;
    this.saveSuccess = null;
  }

  saveChanges(): void {
    if (!this.member) return;

    this.isSaving = true;
    this.saveError = null;
    this.saveSuccess = null;

    const payload: ApartmentMemberUpdateDto = {
      name: this.editModel.name || null,
      phoneNumber: this.editModel.phoneNumber || null,
      idNumber: this.editModel.idNumber || null,
      gender: this.editModel.gender || null,
      status: this.editModel.status || null,
      nationality: this.editModel.nationality || null,
      familyRole: !this.member.isOwner
        ? (this.editModel.familyRole || null)
        : this.member.familyRole,
      dateOfBirth: this.editModel.dateOfBirth || null
    };

    this.residentService
      .updateMember(this.member.apartmentMemberId, payload)
      .subscribe({
        next: () => {
          this.member = {
            ...this.member!,
            name: payload.name ?? this.member!.name,
            phoneNumber: payload.phoneNumber ?? this.member!.phoneNumber,
            idNumber: payload.idNumber ?? this.member!.idNumber,
            gender: payload.gender ?? this.member!.gender,
            status: payload.status ?? this.member!.status,
            nationality: payload.nationality ?? this.member!.nationality,
            familyRole: !this.member!.isOwner
              ? (payload.familyRole ?? this.member!.familyRole)
              : this.member!.familyRole,
            dateOfBirth: payload.dateOfBirth ?? this.member!.dateOfBirth,
            updatedAt: new Date().toISOString()
          };

          this.isSaving = false;
          this.isEditing = false;
          this.saveSuccess = 'Cập nhật thông tin cư dân thành công.';
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật cư dân:', err);

          if (err.status === 409 && err.error?.message) {
            this.saveError = err.error.message;
          } else if (err.status === 404) {
            this.saveError = 'Không tìm thấy cư dân để cập nhật.';
          } else {
            this.saveError = 'Cập nhật thông tin thất bại. Vui lòng thử lại.';
          }

          this.isSaving = false;
        }
      });
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return '...';
    const names = name.trim().split(/\s+/);
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return (firstInitial + lastInitial).toUpperCase();
  }
}
