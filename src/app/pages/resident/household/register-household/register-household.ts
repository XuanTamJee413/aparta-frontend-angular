import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApartmentMemberCreateDto, ApartmentMemberDto, HouseholdService } from '../../../../services/resident/household.service';

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

                  <!-- Quan hệ -->
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

                  <!-- CCCD/ID -->
                  <div class="mb-3">
                    <label for="idNumber" class="form-label">Số CCCD</label>
                    <input type="text" class="form-control" id="idNumber"
                           formControlName="idNumber"
                           [class.is-invalid]="isInvalid('idNumber')">
                    @if (isInvalid('idNumber')) {
                      <div class="invalid-feedback">Vui lòng nhập số CCCD.</div>
                    }
                  </div>

                  <!-- Số điện thoại -->
                  <div class="mb-3">
                    <label for="phoneNumber" class="form-label">Số điện thoại</label>
                    <input type="tel" class="form-control" id="phoneNumber"
                           formControlName="phoneNumber">
                  </div>

                  <!-- Trường Status -->
                  <div class="mb-3">
                    <label for="status" class="form-label">Trạng thái</label>
                    <select class="form-select" id="status"
                            formControlName="status"
                            [class.is-invalid]="isInvalid('status')">
                      <option [value]="null" disabled>-- Chọn trạng thái --</option>
                      <option value="Đang Thuê">Đang Cư Trú</option>
                      <option value="Đi Vắng">Đi Vắng</option>
                    </select>
                    @if (isInvalid('status')) {
                      <div class="invalid-feedback">Vui lòng chọn trạng thái.</div>
                    }
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
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (member of members(); track member.apartmentMemberId) {
                          <tr>
                            <td>{{ member.name }}</td>
                            <td>{{ member.familyRole }}</td>
                            <td>{{ member.dateOfBirth }}</td>
                            <td>{{ member.gender }}</td>
                            <td>
                              @if (confirmingDeleteId() === member.apartmentMemberId) {
                                <span class="me-2 text-danger">Xóa?</span>
                                <button class="btn btn-danger btn-sm me-1" (click)="confirmDelete()">Có</button>
                                <button class="btn btn-secondary btn-sm" (click)="cancelDelete()">Không</button>
                              } @else {
                                @if (!member.isOwner) {
                                  <button class="btn btn-danger btn-sm"
                                          (click)="onDelete(member.apartmentMemberId)">
                                    Xóa
                                  </button>
                                } @else {
                                  <span class="text-muted fst-italic"></span>
                                }
                              }
                            </td>
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

  memberForm!: FormGroup;
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  members = signal<ApartmentMemberDto[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  confirmingDeleteId = signal<string | null>(null);

  ngOnInit(): void {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      familyRole: [null, Validators.required],
      dateOfBirth: [''],
      gender: [null],
      idNumber: ['', Validators.required],
      phoneNumber: [''],
      nationality: ['Việt Nam'],
      status: [null, Validators.required]
    });

    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.householdService.getMyHousehold().subscribe({
      next: (data) => {
        this.members.set(data);
        this.isLoading.set(false);
      },
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
    if (this.memberForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.memberForm.value;
    const isOwner = formValue.familyRole === 'Chủ hộ';

    const createDto: ApartmentMemberCreateDto = {
      apartmentId: '1',
      name: formValue.name,
      familyRole: formValue.familyRole,
      dateOfBirth: formValue.dateOfBirth || null,
      gender: formValue.gender || null,
      idNumber: formValue.idNumber,
      phoneNumber: formValue.phoneNumber || null,
      nationality: formValue.nationality || 'Việt Nam',
      isOwner: isOwner,
      status: formValue.status,
      faceImageUrl: null,
      info: null
    };

    this.householdService.addHouseholdMember(createDto).subscribe({
      next: (newMember) => {
        this.isSubmitting.set(false);
        this.memberForm.reset({
          nationality: 'Việt Nam'
        });
        this.loadMembers();
      },
      error: (err) => {
        this.isSubmitting.set(false);

        let specificError = 'Vui lòng kiểm tra lại thông tin.';

        if (err.status === 500) {
           if (err.error?.message?.includes('column does not allow nulls')) {
                specificError = "Lỗi máy chủ (500): Một trường bắt buộc (như status) đang bị thiếu giá trị.";
           } else {
               specificError = "Lỗi máy chủ (500). Rất có thể 'ApartmentId' = '1' không tồn tại, hoặc CCCD/Số điện thoại bị trùng lặp.";
           }
        }
        else if (err.status === 400) {
          if (err.error && err.error.errors) {
            specificError = Object.values(err.error.errors).flat().join(' ');
          } else if (err.error && typeof err.error.title === 'string' && err.error.title.includes('JSON')) {
             specificError = "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại các trường.";
          } else if (err.error?.message) {
            specificError = err.error.message;
          } else {
            specificError = "Dữ liệu gửi lên không hợp lệ (lỗi 400).";
          }
        }
        else if (err.error?.message) {
          specificError = err.error.message;
        } else if (err.message) {
          specificError = err.message;
        }

        this.submitError.set(`Thêm thành viên thất bại. ${specificError}`);
        console.error('Lỗi thêm thành viên:', err);
      }
    });
  }

  onDelete(memberId: string): void {
    this.confirmingDeleteId.set(memberId);
  }

  cancelDelete(): void {
    this.confirmingDeleteId.set(null);
  }

  confirmDelete(): void {
    const memberIdToDelete = this.confirmingDeleteId();
    if (!memberIdToDelete) {
      return;
    }

    this.householdService.deleteHouseholdMember(memberIdToDelete).subscribe({
      next: () => {
        this.loadMembers();
        this.cancelDelete();
      },
      error: (err) => {
        alert('Xóa thất bại. Vui lòng thử lại.');
        console.error('Lỗi xóa thành viên:', err);
        this.cancelDelete();
      }
    });
  }
}

