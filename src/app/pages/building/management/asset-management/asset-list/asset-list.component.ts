import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';

import {
  AssetManagementService,
  BuildingDto,
  AssetDto,
  AssetView,
  AssetQueryParameters,
  ApiResponse
} from '../../../../../services/management/asset-management/asset-management.service';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
})
export class AssetList implements OnInit {
  assets = signal<AssetView[]>([]);
  buildings = signal<BuildingDto[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  query: AssetQueryParameters = {
    buildingId: null,
    searchTerm: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  filterBuildingId: string = 'all';
  searchTerm: string = '';
  private searchDebouncer = new Subject<string>();
  deletingAssetId = signal<string | null>(null);

  sortField = signal<'quantity' | 'createdAt'>('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  pageIndex = signal(1);
  pageSize  = signal(10);

  totalItems = computed(() => this.assets().length);
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );
  startIndex = computed(() => (this.pageIndex() - 1) * this.pageSize());
  endIndex   = computed(() => Math.min(this.startIndex() + this.pageSize(), this.totalItems()));

  private sortedAssets = computed(() => {
    const data = [...(this.assets() ?? [])];
    const field = this.sortField();
    const order = this.sortOrder();

    const getValue = (a: AssetView) => {
      if (field === 'quantity') return a.quantity ?? 0;
      return a.createdAt ? new Date(a.createdAt).getTime() : Number.NEGATIVE_INFINITY;
    };

    data.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const cmp = va === vb ? 0 : (va < vb ? -1 : 1);
      return order === 'asc' ? cmp : -cmp;
    });

    return data;
  });

  pagedAssets = computed(() => {
    const start = this.startIndex();
    const end   = this.endIndex();
    return this.sortedAssets().slice(start, end);
  });

  constructor(
    private assetService: AssetManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupSearchDebouncer();
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const buildings$ = this.assetService.getMyBuildings().pipe(
      catchError(err => {
        console.error('Lỗi tải Tòa nhà (my-buildings):', err);
        if (err?.status === 403) {
          this.router.navigate(['/forbidden']);
        }
        return of<BuildingDto[]>([]);
      })
    );

    const assets$ = this.assetService.getMyAssets(this.query).pipe(
      catchError((err) => {
        console.error('Lỗi tải Tài sản (my-buildings):', err);
        if (err?.status === 403) {
          this.router.navigate(['/forbidden']);
          return of<ApiResponse<AssetDto[]>>({
            succeeded: false,
            message: 'FORBIDDEN',
            data: []
          });
        }
        return of<ApiResponse<AssetDto[]>>({
          succeeded: false,
          message: 'API_ERROR',
          data: []
        });
      })
    );

    forkJoin({ buildings: buildings$, assetsResponse: assets$ }).subscribe({
      next: (result) => {
        this.buildings.set(result.buildings);

        const resp = result.assetsResponse;
        const noData = (resp.message ?? '').toUpperCase().includes('SM01');

        if (resp.succeeded) {
          this.assets.set(this.mapAssetsToView(resp.data, result.buildings));
        } else if (noData) {
          this.assets.set([]);
        } else if (resp.message === 'FORBIDDEN') {
          this.assets.set([]);
        } else {
          this.error.set(resp.message || 'Không tải được danh sách tài sản.');
          this.assets.set([]);
        }

        this.clampPageIndex();
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err?.status === 403) {
          this.router.navigate(['/forbidden']);
          return;
        }
        this.error.set('Đã xảy ra lỗi khi tải dữ liệu.');
        this.isLoading.set(false);
        console.error('Lỗi forkJoin:', err);
      }
    });
  }

  loadAssets(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.deletingAssetId.set(null);

    this.assetService.getMyAssets(this.query).subscribe({
      next: (resp) => {
        const noData = (resp.message ?? '').toUpperCase().includes('SM01');
        if (resp.succeeded) {
          this.assets.set(this.mapAssetsToView(resp.data, this.buildings()));
        } else if (noData) {
          this.assets.set([]);
        } else {
          this.error.set(resp.message || 'Không tải được danh sách tài sản.');
          this.assets.set([]);
        }
        this.clampPageIndex();
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err?.status === 403) {
          this.router.navigate(['/forbidden']);
          return;
        }
        this.error.set('Không thể tải danh sách tài sản. Vui lòng thử lại.');
        this.isLoading.set(false);
        console.error('Lỗi tải Tài sản:', err);
      }
    });
  }

  private clampPageIndex(): void {
    const max = this.totalPages();
    if (this.pageIndex() > max) this.pageIndex.set(max);
    if (this.pageIndex() < 1)   this.pageIndex.set(1);
  }

  private mapAssetsToView(assets: AssetDto[], buildings: BuildingDto[]): AssetView[] {
    const buildingMap = new Map<string, string>();
    buildings.forEach(b => {
      const buildingName =
        b?.name ??
        (b?.buildingCode ? `(Mã: ${b.buildingCode})` : '(Không có tên)');
      buildingMap.set(b.buildingId, buildingName);
    });

    return (assets ?? []).map(asset => ({
      ...asset,
      createdAt: asset?.createdAt ?? null,
      buildingName: buildingMap.get(asset.buildingId) || `(ID: ${asset.buildingId})`
    }));
  }

  setupSearchDebouncer(): void {
    this.searchDebouncer.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.query.searchTerm = (searchTerm || '').trim() || null;
      this.pageIndex.set(1);
      this.loadAssets();
    });
  }

  onSearchInput(): void {
    this.searchDebouncer.next((this.searchTerm || '').trim());
  }

  onFilterChange(): void {
    this.query.buildingId = this.filterBuildingId === 'all' ? null : this.filterBuildingId;
    this.pageIndex.set(1);
    this.loadAssets();
  }

  onAddAsset(): void {
    this.router.navigate(['manager/manage-asset/create'])
      .catch(err => console.error('Lỗi điều hướng:', err));
  }

  onEdit(asset: AssetView): void {
    this.router.navigate(['manager/manage-asset/edit', asset.assetId])
      .catch(err => console.error('Lỗi điều hướng:', err));
  }

  onAskDelete(asset: AssetView): void {
    this.deletingAssetId.set(asset.assetId);
  }

  onCancelDelete(): void {
    this.deletingAssetId.set(null);
  }

  onConfirmDelete(assetId: string): void {
    this.isLoading.set(true);
    this.assetService.deleteAsset(assetId).subscribe({
      next: () => {
        this.deletingAssetId.set(null);
        this.loadAssets();
      },
      error: (err) => {
        if (err?.status === 403) {
          this.router.navigate(['/forbidden']);
          return;
        }
        console.error('Lỗi xóa tài sản:', err);
        this.error.set('Xóa thất bại. ' + (err?.error?.message || err?.message || ''));
        this.deletingAssetId.set(null);
        this.isLoading.set(false);
      }
    });
  }

  onView(asset: AssetView): void {
    this.router.navigate(['manager/manage-asset/detail', asset.assetId])
      .catch(err => console.error('Lỗi điều hướng:', err));
  }

  onSort(field: 'quantity' | 'createdAt'): void {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('desc');
    }
    this.pageIndex.set(1);
  }

  getSortIcon(field: 'quantity' | 'createdAt'): string {
    if (this.sortField() !== field) return '↕';
    return this.sortOrder() === 'asc' ? '▲' : '▼';
  }

  prevPage(): void { if (this.pageIndex() > 1) this.pageIndex.update(p => p - 1); }
  nextPage(): void { if (this.pageIndex() < this.totalPages()) this.pageIndex.update(p => p + 1); }
  firstPage(): void { this.pageIndex.set(1); }
  lastPage(): void { this.pageIndex.set(this.totalPages()); }
}
