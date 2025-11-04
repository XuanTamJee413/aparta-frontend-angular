import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AssetManagementService,
  BuildingDto,
  Asset,
  AssetUpdateDto,
  AssetView
} from '../../../../../services/management/asset-management/asset-management.service';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
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
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const assets$ = this.assetService.getAssets();
    const buildings$ = this.assetService.getBuildings();

    forkJoin({ assets: assets$, buildings: buildings$ }).subscribe({
      next: (result) => {
        const assets: Asset[] = result.assets;
        const buildings: BuildingDto[] = result.buildings;

        const buildingMap = new Map<string, string>();
        buildings.forEach(b => buildingMap.set(b.buildingId, b.name));

        const assetViews: AssetView[] = assets.map(asset => ({
          ...asset,
          buildingName: buildingMap.get(asset.buildingId) || `(ID: ${asset.buildingId})`
        }));

        this.assets.set(assetViews);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải được dữ liệu (assets hoặc buildings). Vui lòng kiểm tra lại API và CORS.');
        this.isLoading.set(false);
        console.error('forkJoin error (Assets/Buildings):', err);
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

    if (newQuantity === null || newQuantity < 0 || assetId === null) return;
    if (!newInfo) return;

    const requestDto: AssetUpdateDto = { info: newInfo, quantity: newQuantity };
    const updatedAssetInUi: AssetView = { ...asset, info: newInfo, quantity: newQuantity };

    this.assetService.updateAsset(assetId, requestDto).subscribe({
      next: () => {
        this.assets.update(list => list.map(a => (a.assetId === assetId ? updatedAssetInUi : a)));
        this.onCancelEdit();
      },
      error: (err) => {
        console.error('Update asset error:', err);
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
        this.assets.update(list => list.filter(a => a.assetId !== assetId));
        this.deletingAssetId.set(null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Delete asset error:', err);
        this.error.set('Xóa thất bại. ' + (err.error?.message || err.message));
        this.deletingAssetId.set(null);
        this.isLoading.set(false);
      }
    });
  }

  onAddAsset(): void {
    this.router.navigate(['manager/manage-asset/create'])
      .catch(err => console.error('Navigate failed:', err));
  }
}
