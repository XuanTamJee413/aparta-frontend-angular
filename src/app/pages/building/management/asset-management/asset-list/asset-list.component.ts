import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AssetManagementService,
  BuildingDto,
  Asset,
  AssetUpdateDto
} from '../../../../../services/management/asset-management/asset-management.service';


export interface AssetView extends Asset {
  buildingName: string;
}

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
                <h5 class="card-title mb-0">Danh sách tài sản</h5>
              </div>
              <div class="card-body">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3">
                  <div class="input-group search-group">
                    <span class="input-group-text">Tìm kiếm</span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Theo Tên Tòa nhà, Tên tài sản..."
                      [value]="searchTerm()"
                      (input)="onSearch(($any($event.target)).value)"
                      aria-label="Tìm kiếm tài sản"
                      />
                  </div>
                  <button class="btn btn-success fw-medium" (click)="onAddAsset()">
                    + Thêm Tài Sản
                  </button>
                </div>

                @if (isLoading()) {
                  <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <p class="mt-2">Đang tải dữ liệu...</p>
                  </div>
                }
                @if (error()) {
                  <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Lỗi:</strong> {{ error() }}
                    <button type = "button" class="btn-close" (click)="error.set(null)" aria-label="Close"></button>
                  </div>
                }

                @if (!isLoading()) {
                  <table class="table table-striped" style="width:100%">
                    <thead>
                      <tr>
                        <th>Tên Tòa Nhà</th>
                        <th>Tên Tài Sản</th>
                        <th>Số Lượng</th>
                        <th class="text-end">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (asset of filteredAssets(); track asset.assetId) {
                        <tr>
                          <td>{{ asset.buildingName }}</td>

                          <td>
                            @if (editingAssetId() === asset.assetId) {
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                [value]="editedInfo()"
                                (input)="editedInfo.set(($any($event.target)).value)"
                                (keydown.enter)="onSave(asset)"
                                (keydown.escape)="onCancelEdit()"
                                />
                            } @else {
                              {{ asset.info }}
                            }
                          </td>

                          <td>
                            @if (editingAssetId() === asset.assetId) {
                              <input
                                type="number"
                                class="form-control form-control-sm"
                                style="width: 100px;"
                                [value]="editedQuantity()"
                                (input)="editedQuantity.set(($any($event.target)).valueAsNumber)"
                                (keydown.enter)="onSave(asset)"
                                (keydown.escape)="onCancelEdit()"
                                />
                            } @else {
                              {{ asset.quantity }}
                            }
                          </td>

                          <td class="text-end">
                            @if (editingAssetId() === asset.assetId) {
                              <button
                                class="btn btn-success btn-sm me-1"
                                (click)="onSave(asset)">
                                Lưu
                              </button>
                              <button
                                class="btn btn-secondary btn-sm"
                                (click)="onCancelEdit()">
                                Hủy
                              </button>
                            }
                            @else if (deletingAssetId() === asset.assetId) {
                              <button
                                class="btn btn-danger btn-sm me-1"
                                (click)="onConfirmDelete(asset)">
                                Xác nhận
                              </button>
                              <button
                                class="btn btn-secondary btn-sm"
                                (click)="onCancelDelete()">
                                Hủy
                              </button>
                            }
                            @else {
                              <button
                                class="btn btn-primary btn-sm me-1"
                                (click)="onEdit(asset)">
                                Sửa
                              </button>
                              <button
                                class="btn btn-danger btn-sm"
                                (click)="onAskDelete(asset)">
                                Xóa
                              </button>
                            }
                          </td>
                        </tr>
                      }
                      @empty {
                        <tr>
                          <td colspan="4" class="text-center">
                            Không có tài sản nào khớp với tìm kiếm.
                          </td>
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
  styles: [`
    .search-group { width: 100%; max-width: 560px; }
    @media (max-width: 576px) {
      .search-group { max-width: 100%; }
    }
  `]
})

export class AssetList implements OnInit {

  assets = signal<AssetView[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  editingAssetId = signal<string | null>(null);
  editedQuantity = signal<number>(0);
  editedInfo = signal<string>('');

  deletingAssetId = signal<string | null>(null);

  filteredAssets = computed(() => {
    const t = this.searchTerm().toLowerCase();
    if (!t) return this.assets();
    return this.assets().filter(a =>
      (a.buildingName ?? '').toLowerCase().includes(t) ||
      (a.info ?? '').toLowerCase().includes(t) ||
      String(a.quantity ?? '').toLowerCase().includes(t)
    );
  });

  constructor(
    private assetService: AssetManagementService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const assets$ = this.assetService.getAssets(); // <-- Giờ trả về Observable<Asset[]>
    const buildings$ = this.assetService.getBuildings();

    forkJoin({
      assets: assets$,
      buildings: buildings$
    }).subscribe({
      next: (result) => {
        const assets: Asset[] = result.assets;
        const buildings: BuildingDto[] = result.buildings;

        const buildingMap = new Map<string, string>();
        buildings.forEach(b => {
          buildingMap.set(b.buildingId, b.name);
        });

        const assetViews: AssetView[] = assets.map(asset => ({
          ...asset,
          buildingName: buildingMap.get(asset.buildingId) || `(ID: ${asset.buildingId})`
        }));

        this.assets.set(assetViews);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải được dữ liệu (assets hoặc buildings). Vui lòng kiểm tra lại API và chính sách CORS.');
        this.isLoading.set(false);
        console.error('Lỗi khi gọi forkJoin (Assets/Buildings):', err);
      }
    });
  }


  onSearch(term: string): void {
    this.searchTerm.set(term.trim());
  }

  onEdit(asset: AssetView): void {
    this.deletingAssetId.set(null);
    this.editingAssetId.set(asset.assetId);
    this.editedQuantity.set(asset.quantity);
    this.editedInfo.set(asset.info);
  }

  onCancelEdit(): void {
    this.editingAssetId.set(null);
  }

  onSave(asset: AssetView): void {
    const newQuantity = this.editedQuantity();
    const newInfo = this.editedInfo().trim();
    const assetId = this.editingAssetId();

    if (newQuantity === null || newQuantity < 0 || assetId === null) {
      console.error("Số lượng không hợp lệ hoặc không có ID."); return;
    }
    if (!newInfo) {
      console.error("Tên tài sản (Info) không được để trống."); return;
    }

    const requestDto: AssetUpdateDto = {
      info: newInfo,
      quantity: newQuantity
    };

    const updatedAssetInUi: AssetView = {
      ...asset,
      info: newInfo,
      quantity: newQuantity
    };

    this.assetService.updateAsset(assetId, requestDto).subscribe({
      next: () => {
        this.assets.update(currentAssets =>
          currentAssets.map(a =>
            a.assetId === assetId ? updatedAssetInUi : a
          )
        );
        this.onCancelEdit();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật tài sản:', err);
        this.error.set('Cập nhật thất bại. ' + (err.error?.message || err.message));
      }
    });
  }

  onAskDelete(asset: AssetView): void {
    this.onCancelEdit();
    this.deletingAssetId.set(asset.assetId);
  }

  onCancelDelete(): void {
    this.deletingAssetId.set(null);
  }

  onConfirmDelete(asset: AssetView): void {
    this.isLoading.set(true);
    this.error.set(null);
    const assetId = asset.assetId;

    this.assetService.deleteAsset(assetId).subscribe({
      next: () => {
        this.assets.update(currentAssets =>
          currentAssets.filter(a => a.assetId !== assetId)
        );
        this.deletingAssetId.set(null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Lỗi khi xóa tài sản:', err);
        this.error.set('Xóa thất bại. ' + (err.error?.message || err.message));
        this.deletingAssetId.set(null);
        this.isLoading.set(false);
      }
    });
  }

  onAddAsset(): void {
    this.router.navigate(['manager/manage-asset/create'])
      .catch(err => console.error('Không điều hướng được tới trang tạo Tài Sản:', err));
  }
}

