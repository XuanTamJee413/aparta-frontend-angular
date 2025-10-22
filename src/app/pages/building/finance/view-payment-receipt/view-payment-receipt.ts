import { Component } from '@angular/core';

// Import các module cần thiết cho Standalone Component
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-view-payment-receipt',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './view-payment-receipt.html',
  styleUrls: ['./view-payment-receipt.css']
})
export class ViewPaymentReceipt {

  receipt = {
    id: 'TXN-123456789',
    date: new Date(),
    paymentMethod: 'Chuyển khoản ngân hàng',
    status: 'Đã thanh toán',
    from: {
      name: 'Ban Quản Lý Tòa Nhà XYZ',
      address: '123 Đường ABC, Phường 1, Quận 2, TP. HCM',
      email: 'bql@xyz-apartment.com'
    },
    to: {
      name: 'Nguyễn Văn A',
      apartment: 'Căn hộ A-101',
      email: 'nguyenvana@email.com'
    },
    items: [
      { description: 'Phí quản lý - Tháng 10/2025', amount: 1200000 },
      { description: 'Phí gửi xe ô tô - BS 51K-123.45', amount: 800000 },
      { description: 'Phí sử dụng hồ bơi', amount: 150000 },
    ],
    subtotal: 2150000,
    discount: 0,
    total: 2150000
  };

  constructor() { }

  printReceipt() {
    window.print();
  }

  downloadPDF() {
    alert('Chức năng tải PDF đang được phát triển!');
  }
}
