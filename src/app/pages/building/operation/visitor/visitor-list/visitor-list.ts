import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitorService, VisitLogStaffViewDto, ApartmentDto } from '../../../../../services/resident/visitor.service';
import { FastCheckin } from '../fast-checkin/fast-checkin';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [
    CommonModule,
    FastCheckin
  ],
  templateUrl: './visitor-list.html',
  styleUrl: './visitor-list.css'
})
export class VisitorList implements OnInit {

  allVisitors: VisitLogStaffViewDto[] = [];
  isLoading = false;
  showFastCheckin = false;

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';
  private alertTimeout: any;

  isModalVisible = false;
  selectedVisitor: VisitLogStaffViewDto | null = null;
  apartmentList: ApartmentDto[] = [];

  constructor(
    private visitorService: VisitorService
  ) { }

  ngOnInit(): void {
    this.loadAllVisitors();
    this.loadApartments();
  }

  loadAllVisitors(): void {
    this.isLoading = true;
    this.visitorService.getAllVisitors().subscribe({
      next: (data) => {
        this.allVisitors = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading all visitors', err);
        this.showAlert('Không thể tải danh sách khách thăm', 'danger');
        this.isLoading = false;
      }
    });
  }
  loadApartments(): void {
    this.apartmentList = [
      { apartmentId: 'ap1', apartmentCode: 'TX_101' },
      { apartmentId: 'ap2', apartmentCode: 'TX_102' },
      { apartmentId: 'ap3', apartmentCode: 'TX_201' },
      { apartmentId: 'ap4', apartmentCode: 'TX_202' },
      { apartmentId: 'ap5', apartmentCode: 'B-305' }
    ];

    /*
    this.visitorService.getAllApartments().subscribe({
      next: (data) => {
        this.apartmentList = data;
      },
      error: (err) => {
        console.error('Lỗi tải danh sách căn hộ', err);
      }
    });
    */
  }
  openVisitorDetails(visitor: VisitLogStaffViewDto): void {
    this.selectedVisitor = visitor;
    this.isModalVisible = true;
  }

  closeVisitorDetails(): void {
    this.isModalVisible = false;
    this.selectedVisitor = null;
  }

  onCheckIn(visitor: VisitLogStaffViewDto): void {
    if (visitor.status === 'Checked-in' || visitor.status === 'Checked-out') {
      return;
    }

    this.visitorService.checkInVisitor(visitor.visitLogId).subscribe({
      next: () => {
        this.showAlert(`Đã check-in cho khách: ${visitor.visitorFullName}`, 'success');
        this.loadAllVisitors();
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Lỗi: Không thể check-in', 'danger');
        console.error(err);
      }
    });
  }

  onCheckOut(visitor: VisitLogStaffViewDto): void {
    if (visitor.status !== 'Checked-in') {
      return;
    }

    this.visitorService.checkOutVisitor(visitor.visitLogId).subscribe({
      next: () => {
        this.showAlert(`Đã check-out cho khách: ${visitor.visitorFullName}`, 'success');
        this.loadAllVisitors();
      },
      error: (err) => {
        this.showAlert(err?.error?.message || 'Lỗi: Không thể check-out', 'danger');
        console.error(err);
      }
    });
  }
  onFastCheckinSuccess(visitorName: string): void {
    this.showAlert(`Đã tạo và check-in khách: ${visitorName}`, 'success');
    this.showFastCheckin = false;
    this.loadAllVisitors(); 
  }

  onFastCheckinClose(): void {
    this.showFastCheckin = false;
  }
  getStatusBadge(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-bg-warning';
      case 'checked-in':
        return 'text-bg-success';
      case 'checked-out':
        return 'text-bg-secondary';
      case 'cancelled':
        return 'text-bg-danger';
      default:
        return 'text-bg-light';
    }
  }
  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;

    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }

    this.alertTimeout = setTimeout(() => {
      this.alertMessage = null;
    }, 3000);
  }
}