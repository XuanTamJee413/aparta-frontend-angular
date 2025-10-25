import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetManagementService } from '../../../../../services/management/asset-management/asset-management.service';


export interface Asset {
  assetId: string;
  buildingId: string;
  info: string;
  quantity: Int16Array;
}


@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="content">
      <div class="container-fluid p-0">
        <div class="mb-3">

          <h1 class="h3 d-inline align-middle">Quản lý Tài sản</h1>
        </div>
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">

                <h5 class="card-title">Danh sách tài sản</h5>
              </div>
              <div class="card-body">

                @if (isLoading) {
                  <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <p class="mt-2">Đang tải dữ liệu...</p>
                  </div>
                } @else if (error) {
                  <div class="alert alert-danger">
                    {{ error }}
                  </div>
                } @else {
                  <table class="table table-striped" style="width:100%">
                    <thead>
                      <tr>

                        <th>ID</th>
                        <th>Thuộc Tòa Nhà</th>
                        <th>Tên Tài Sản</th>
                        <th>Số Lượng</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>

                      @for (asset of assets; track asset.assetId) {
                        <tr>
                          <td>{{ asset.assetId }}</td>
                          <td>{{ asset.buildingId }}</td>
                          <td>{{ asset.info }}</td>
                          <td>{{ asset.quantity }}</td>
                          <td>
                            <button class="btn btn-primary btn-sm me-1">Sửa</button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>

                          <td colspan="5" class="text-center">Không có tài sản nào trong danh sách.</td>
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
export class AssetList implements OnInit {

  assets: Asset[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private assetService: AssetManagementService) { }

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.isLoading = true;
    this.error = null;


    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data;
        this.isLoading = false;
        if (data.length === 0) {
          console.warn("API Assets trả về danh sách rỗng.");
        }
      },
      error: (err) => {
        this.error = 'Không thể tải được danh sách tài sản. Vui lòng kiểm tra lại API và chính sách CORS.';
        this.isLoading = false;
        console.error('Lỗi khi gọi API Assets:', err);
      }
    });
  }
}
