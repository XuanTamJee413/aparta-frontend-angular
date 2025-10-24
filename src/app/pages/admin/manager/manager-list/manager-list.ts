import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../../../shared/material.module';
import { Manager, ManagerService } from '../../../../services/admin/manager.service';


@Component({
  selector: 'app-manager-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    MaterialModule
  ], 
  templateUrl: './manager-list.html', 
  styleUrls: ['./manager-list.css']
})
export class ManagerListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['staffCode', 'name', 'email', 'phone', 'status', 'actions'];
  dataSource = new MatTableDataSource<Manager>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  managers: Manager[] = [];
  filteredManagers: Manager[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadManagers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadManagers(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.managerService.getAllManagers(this.searchTerm).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.managers = response.data as Manager[];
          this.filteredManagers = [...this.managers];
          this.dataSource.data = this.filteredManagers;
          
          if (this.paginator) {
            this.paginator.firstPage();
          }
        } else {
          this.errorMessage = response.message || 'Failed to load managers';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading managers';
        this.loading = false;
        console.error('Error loading managers:', error);
      }
    });
  }

  onSearch(): void {
    this.loadManagers();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.loadManagers();
  }
}