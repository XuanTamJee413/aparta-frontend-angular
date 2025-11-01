import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { 
  PriceQuotationService, 
  PriceQuotationDto, 
  BuildingDto, 
  PriceQuotationQueryParams,
  PagedList
} from '../../../../../services/management/price-quotation.service';

@Component({
  selector: 'app-price-quotation-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatTableModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './pricequotation-list.html',
  styleUrls: ['./pricequotation-list.css']
})
export class PriceQuotationListComponent implements OnInit {

  private quotationService = inject(PriceQuotationService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  buildings: BuildingDto[] = [];
  pagedData: PagedList<PriceQuotationDto> | null = null;
  displayedColumns: string[] = ['feeType', 'buildingCode', 'calculationMethod', 'unitPrice', 'unit', 'actions'];

  isLoading = true;
  
  queryParams: PriceQuotationQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    buildingId: '',
    searchTerm: ''
  };
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadBuildings();
    this.loadQuotations();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(term => {
      this.queryParams.searchTerm = term;
      this.queryParams.pageNumber = 1;
      this.loadQuotations();
    });
  }

  loadQuotations(): void {
    this.isLoading = true;
    this.quotationService.getPriceQuotations(this.queryParams).subscribe({
      next: (pagedData) => {
        this.pagedData = pagedData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Không thể tải danh sách đơn giá', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadBuildings(): void {
    this.quotationService.getBuildings().subscribe({
      next: (data) => {
        this.buildings = data;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Không thể tải danh sách tòa nhà', 'Đóng', { duration: 3000 });
      }
    });
  }

  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  onBuildingFilterChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadQuotations();
  }

  onPageChange(pageNumber: number): void {
    if (pageNumber < 1 || (this.pagedData && pageNumber > this.pagedData.totalPages) || pageNumber === this.queryParams.pageNumber) {
      return; 
    }
    this.queryParams.pageNumber = pageNumber;
    this.loadQuotations();
  }
  
  getPaginationArray(): number[] {
    if (!this.pagedData) return [];
    return Array(this.pagedData.totalPages).fill(0).map((x, i) => i + 1);
  }

  goToCreate(): void {
    this.router.navigate(['/manager/manage-quotation/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/manager/manage-quotation/edit', id]);
  }

  deleteQuotation(id: string, feeType: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn giá "${feeType}"?`)) {
      this.quotationService.deletePriceQuotation(id).subscribe({
        next: (res) => {
          if (res.succeeded) {
            this.snackBar.open(res.message || 'Xóa thành công', 'Đóng', { duration: 3000 });
            this.loadQuotations();
          } else {
            this.snackBar.open(res.message, 'Đóng', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Lỗi: Không thể xóa đơn giá', 'Đóng', { duration: 3000 });
        }
      });
    }
  }
}