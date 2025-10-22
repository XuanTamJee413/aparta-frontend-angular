
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResidentManagementService } from '../../../../services/management/resident-management.service';



export interface ApartmentMember {
  apartmentMemberId: string;
  apartmentId: string | null;
  name: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [CommonModule],

  template: `
    <main class="content">
      <div class="container-fluid p-0">
        <div class="mb-3">
          <h1 class="h3 d-inline align-middle">Quản lý Cư dân</h1>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title">Danh sách cư dân</h5>
              </div>
              <div class="card-body">

                @if (isLoading) {
                  <div class="text-center">
                    <p>Đang tải dữ liệu...</p>
                  </div>
                } @else if (error) {
                  <div class="alert alert-danger">
                    {{ error }}
                  </div>
                } @else {
                  <table class="table table-striped" style="width:100%">
                    <thead>
                      <tr>
                        <th>Họ tên</th>
                        <th>Căn hộ</th>
                        <th>Số điện thoại</th>
                        <th>Ngày sinh</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (member of members; track member.apartmentMemberId) {
                        <tr>
                          <td>{{ member.name }}</td>
                          <td>{{ member.apartmentId }}</td>
                          <td>{{ member.phoneNumber }}</td>
                          <td>{{ member.dateOfBirth | date: 'dd/MM/yyyy' }}</td>
                          <td>
                            <button class="btn btn-primary btn-sm me-1">Sửa</button>
                            <button class="btn btn-danger btn-sm">Xóa</button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="text-center">Không có cư dân nào trong danh sách.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class ResidentList implements OnInit {

  members: ApartmentMember[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private residentService: ResidentManagementService) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading = true;
    this.error = null;

    this.residentService.getMembers().subscribe({
      next: (data) => {
        this.members = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải được danh sách cư dân. Vui lòng kiểm tra lại API và chính sách CORS.';
        this.isLoading = false;
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }
}
