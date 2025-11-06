import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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

    const buildings$ = this.assetService.getBuildings()
      .pipe(
        catchError(err => {
          console.error('Lỗi tải Tòa nhà:', err);
          return of<BuildingDto[]>([]);
        })
      );

    const assets$ = this.assetService.getAssets(this.query)
      .pipe(
        catchError(err => {
          console.error('Lỗi tải Tài sản:', err);
          return of<ApiResponse<AssetDto[]>>({ succeeded: false, message: 'API_ERROR', data: [] });
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
        } else {
          this.error.set(resp.message || 'Không tải được danh sách tài sản.');
          this.assets.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Đã xảy ra lỗi khi tải dữ liệu.');
        this.isLoading.set(false);
        console.error('Lỗi forkJoin:', err);
      }
    });
  }

  setupSearchDebouncer(): void {
    this.searchDebouncer.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.query.searchTerm = searchTerm || null;
      this.loadAssets();
    });
  }

  loadAssets(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.deletingAssetId.set(null);

    this.assetService.getAssets(this.query).subscribe({
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
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách tài sản. Vui lòng thử lại.');
        this.isLoading.set(false);
        console.error('Lỗi tải Tài sản:', err);
      }
    });
  }

  private mapAssetsToView(assets: AssetDto[], buildings: BuildingDto[]): AssetView[] {
    const buildingMap = new Map<string, string>();
    buildings.forEach(b => {
      const buildingName = b?.name ?? (b?.buildingCode ? `(Mã: ${b.buildingCode})` : '(Không có tên)');
      buildingMap.set(b.buildingId, buildingName);
    });

    return (assets ?? []).map(asset => ({
      ...asset,
      createdAt: asset?.createdAt ?? null,
      buildingName: buildingMap.get(asset.buildingId) || `(ID: ${asset.buildingId})`
    }));
  }

  onSearchInput(): void {
    this.searchDebouncer.next((this.searchTerm || '').trim());
  }

  onFilterChange(): void {
    this.query.buildingId = this.filterBuildingId === 'all' ? null : this.filterBuildingId;
    this.loadAssets();
  }

  onAddAsset(): void {
    this.router.navigate(['manager/manage-asset/create']).catch(err => console.error('Lỗi điều hướng:', err));
  }

  onEdit(asset: AssetView): void {
    this.router.navigate(['manager/manage-asset/edit', asset.assetId]).catch(err => console.error('Lỗi điều hướng:', err));
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
        console.error('Lỗi xóa tài sản:', err);
        this.error.set('Xóa thất bại. ' + (err?.error?.message || err?.message || ''));
        this.deletingAssetId.set(null);
        this.isLoading.set(false);
      }
    });
  }

  onView(asset: AssetView): void {
    this.router.navigate(['manager/manage-asset/detail', asset.assetId]).catch(err => console.error('Lỗi điều hướng:', err));
  }
}
