import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BuildingService, BuildingDto, BuildingListResponse } from '../../../../services/admin/building.service';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.css']
})
export class BuildingListComponent implements OnInit {
  buildings: BuildingDto[] = [];
  searchTerm: string = '';
  
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  isLoading = false;
  
  Math = Math; 

  constructor(private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  loadBuildings() {
    this.isLoading = true;
    const skip = (this.currentPage - 1) * this.pageSize;
    
    const query = {
      searchTerm: this.searchTerm || undefined,
      skip: skip,
      take: this.pageSize
    };

    this.buildingService.getBuildings(query).subscribe({
      next: (res: BuildingListResponse) => {
        if (res.succeeded && res.data) {
          this.buildings = res.data.items;
          this.totalCount = res.data.totalCount;
        } else {
          this.buildings = [];
          this.totalCount = 0;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadBuildings();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBuildings();
  }

  get hasPreviousPage(): boolean { return this.currentPage > 1; }
  get hasNextPage(): boolean { return this.currentPage * this.pageSize < this.totalCount; }
  get totalPages(): number { return Math.ceil(this.totalCount / this.pageSize); }
}