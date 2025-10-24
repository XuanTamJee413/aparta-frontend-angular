// src/app/pages/admin/building/operation/service-list/service-list.component.ts

import { Component, OnInit } from '@angular/core';
import { ServiceDto } from '../../../../models/service.model';
import { ServiceService } from '../../../../services/operation/service.service';
import { CommonModule } from '@angular/common'; // Cần thiết cho *ngFor
//import { ButtonModule } from 'primeng/button'; // Ví dụ nếu bạn dùng PrimeNG


@Component({
  selector: 'app-service-list',
  standalone: true, // Giả sử bạn đang dùng component độc lập
  imports: [
    CommonModule,
    //ButtonModule 
    // Thêm các module UI khác nếu cần (ví dụ: TableModule)
  ], 
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css']
})
export class ServiceListComponent implements OnInit {

  services: ServiceDto[] = []; // Biến để lưu danh sách dịch vụ

  constructor(private serviceService: ServiceService) { } // 1. Tiêm service

  ngOnInit(): void {
    this.loadServices(); // 2. Tải dữ liệu khi component khởi tạo
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data; // 3. Gán dữ liệu cho biến
        console.log('Tải dịch vụ thành công:', data);
      },
      error: (err) => {
        console.error('Lỗi khi tải dịch vụ:', err);
      }
    });
  }

  // 4. Tạo hàm để Xóa (ví dụ)
  delete(id: string): void {
    if (confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      this.serviceService.deleteService(id).subscribe({
        next: () => {
          console.log('Xóa thành công');
          this.loadServices(); // Tải lại danh sách sau khi xóa
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
        }
      });
    }
  }

  // Bạn sẽ tạo thêm các hàm openCreateModal(), openEditModal(service: ServiceDto)...
}