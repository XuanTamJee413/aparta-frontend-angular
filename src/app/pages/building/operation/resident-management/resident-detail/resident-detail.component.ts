import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResidentManagementService, ApartmentMember } from '../../../../../services/management/resident-management.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-resident-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './resident-detail.component.html',
  styleUrls: ['./resident-detail.component.css']
})
export class ResidentDetail implements OnInit {
  member: ApartmentMember | null = null;
  apartmentCode: string | null = null;
  isLoading = true;
  error: string | null = null;

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
            next: (apt) => this.apartmentCode = apt?.code ?? null,
            error: (e) => {
              console.error('Lỗi lấy Apartment Code:', e);
              this.apartmentCode = null;
            }
          });
        }

        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = (err.status === 404)
          ? 'Không tìm thấy thông tin cư dân.'
          : 'Không thể tải được dữ liệu. Vui lòng thử lại sau.';
        console.error('Lỗi khi gọi API chi tiết:', err);
        this.isLoading = false;
      }
    });
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return '...';
    const names = name.trim().split(/\s+/);
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? (names[names.length - 1]?.[0] ?? '') : '';
    return (firstInitial + lastInitial).toUpperCase();
  }
}
