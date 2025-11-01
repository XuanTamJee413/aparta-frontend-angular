import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApartmentMemberCreateDto, ApartmentMemberDto, HouseholdService } from '../../../../services/resident/household.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-register-household',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="content">
      <div class="container-fluid p-0">
        <h1 class="h3 mb-3">Khai báo Hộ khẩu</h1>

        <div class="row">
          <div class="col-12 col-lg-5">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Thêm thành viên</h5>
              </div>
              <div class="card-body">
                <form [formGroup]="memberForm" (ngSubmit)="onSubmit()">

                  <div class="mb-3">
                    <label for="name" class="form-label">Họ và Tên</label>
                    <input type="text" class="form-control" id="name"
                           formControlName="name"
                           [class.is-invalid]="isInvalid('name')">
                    @if (isInvalid('name')) {
                      <div class="invalid-feedback">Vui lòng nhập họ tên.</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label for="familyRole" class="form-label">Quan hệ với chủ hộ</label>
                    <select class="form-select" id="familyRole"
                            formControlName="familyRole"
                            [class.is-invalid]="isInvalid('familyRole')">
                      <option [value]="null" disabled>-- Chọn quan hệ --</option>
                      <option value="Vợ">Vợ</option>
                      <option value="Chồng">Chồng</option>
                      <option value="Con">Con</option>
                      <option value="Bố">Bố</option>
                      <option value="Mẹ">Mẹ</option>
                      <option value="Khác">Khác</option>
                    </select>
                    @if (isInvalid('familyRole')) {
                      <div class="invalid-feedback">Vui lòng chọn quan hệ.</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label for="dateOfBirth" class="form-label">Ngày sinh</label>
                    <input type="date" class="form-control" id="dateOfBirth"
                           formControlName="dateOfBirth">
                  </div>

                  <div class="mb-3">
                    <label for="gender" class="form-label">Giới tính</label>
                    <select class="form-select" id="gender" formControlName="gender">
                      <option [value]="null">-- Chọn giới tính --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="idNumber" class="form-label">Số CCCD</label>
                    <input type="text" class="form-control" id="idNumber"
                           formControlName="idNumber"
                           [class.is-invalid]="isInvalid('idNumber')">
                    @if (isInvalid('idNumber')) {
                      <div class="invalid-feedback">Vui lòng nhập số CCCD.</div>
                    }
                  </div>

                  <div class="mb-3">
                    <label for="phoneNumber" class="form-label">Số điện thoại</label>
                    <input type="tel" class="form-control" id="phoneNumber"
                           formControlName="phoneNumber">
                  </div>

                  <div class="mb-3">
                    <label for="nationality" class="form-label">Quốc tịch</label>
                    <input type="text" class="form-control" id="nationality"
                           formControlName="nationality" placeholder="Việt Nam">
                  </div>


                  <div class="d-grid">
                    <button type="submit" class="btn btn-success"
                            [disabled]="memberForm.invalid || isSubmitting()">
                      @if (isSubmitting()) {
                        <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                        Đang lưu...
                      } @else {
                        Thêm thành viên
                      }
                    </button>
                  </div>

                  @if (submitError()) {
                    <div class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                      {{ submitError() }}
                      <button type="button" class="btn-close" (click)="submitError.set(null)" aria-label="Close"></button>
                    </div>
                  }

                </form>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-7">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Danh sách hộ khẩu</h5>
              </div>
              <div class="card-body">
                @if (isLoading()) {
                  <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                } @else if (loadError()) {
                  <div class="alert alert-danger">{{ loadError() }}</div>
                } @else if (members().length === 0) {
                  <div class="text-center">Chưa có thành viên nào được khai báo.</div>
                } @else {
                  <div class="table-responsive">
                    <table class="table table-striped" style="width:100%">
                      <thead>
                        <tr>
                          <th>Họ Tên</th>
                          <th>Quan hệ</th>
                          <th>Ngày sinh</th>
                          <th>Giới tính</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (member of members(); track member.apartmentMemberId) {
                          <tr>
                            <td>{{ member.name }}</td>
                            <td>{{ member.familyRole }}</td>
                            <td>{{ member.dateOfBirth }}</td>
                            <td>{{ member.gender }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: ``
})
export class RegisterHousehold implements OnInit {
  private fb = inject(FormBuilder);
  private householdService = inject(HouseholdService);
  private auth = inject(AuthService);

  memberForm!: FormGroup;
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  members = signal<ApartmentMemberDto[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  confirmingDeleteId = signal<string | null>(null);

  private getApartmentId(): string | null {
    const payload = this.auth.user();
    const id = payload?.apartment_id;
    return id ? String(id) : null;
  }

  ngOnInit(): void {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      familyRole: [null, Validators.required],
      dateOfBirth: [''],
      gender: [null],
      idNumber: ['', Validators.required],
      phoneNumber: [''],
      nationality: ['Việt Nam'],
    });

    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    const apartmentId = this.getApartmentId();
    if (!apartmentId) {
      this.isLoading.set(false);
      this.loadError.set('Không tìm thấy apartmentId trong phiên đăng nhập.');
      return;
    }

    this.householdService.getMembersByApartment(apartmentId).subscribe({
      next: (data) => { this.members.set(data); this.isLoading.set(false); },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set('Không thể tải danh sách hộ khẩu. Vui lòng thử lại.');
        console.error('Lỗi tải hộ khẩu:', err);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.memberForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    this.memberForm.markAllAsTouched();
    if (this.memberForm.invalid) return;

    const apartmentId = this.getApartmentId();
    if (!apartmentId) {
      this.submitError.set('Không tìm thấy apartmentId trong phiên đăng nhập.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const v = this.memberForm.value;
    const createDto: ApartmentMemberCreateDto = {
      apartmentId,
      name: v.name!,
      familyRole: v.familyRole!,
      dateOfBirth: v.dateOfBirth || null,
      gender: v.gender || null,
      idNumber: v.idNumber!,
      phoneNumber: v.phoneNumber || null,
      nationality: v.nationality || 'Việt Nam',
      isOwner: v.familyRole === 'Chủ hộ' || false,
      status: 'Đang cư trú',
      faceImageUrl: null,
      info: null
    };

    this.householdService.addHouseholdMember(createDto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.memberForm.reset({ nationality: 'Việt Nam' });
        this.loadMembers();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        let msg = 'Vui lòng kiểm tra lại thông tin.';
        if (err.status === 500) {
          if (err.error?.message?.includes('column does not allow nulls')) {
            msg = 'Lỗi máy chủ (500): Một trường bắt buộc đang thiếu giá trị.';
          } else {
            msg = 'Lỗi máy chủ (500). Có thể trùng CCCD/SĐT hoặc dữ liệu không hợp lệ.';
          }
        } else if (err.status === 400) {
          if (err.error?.errors) msg = Object.values(err.error.errors).flat().join(' ');
          else if (typeof err.error?.title === 'string' && err.error.title.includes('JSON')) msg = 'Dữ liệu gửi lên không hợp lệ.';
          else if (err.error?.message) msg = err.error.message;
          else msg = 'Dữ liệu gửi lên không hợp lệ (400).';
        } else if (err.error?.message) msg = err.error.message;
        else if (err.message) msg = err.message;

        this.submitError.set(`Thêm thành viên thất bại. ${msg}`);
        console.error('Lỗi thêm thành viên:', err);
      }
    });
  }

}
