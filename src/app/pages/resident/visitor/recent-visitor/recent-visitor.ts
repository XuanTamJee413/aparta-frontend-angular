import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { VisitorDto, VisitorService } from '../../../../services/resident/visitor.service';

@Component({
  selector: 'app-recent-visitor-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Chọn khách thăm trước đây</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100" style="width: 100%; margin-bottom: 10px;">
        <mat-label>Tìm kiếm...</mat-label>
        <input matInput [(ngModel)]="searchText" (ngModelChange)="filterList()" placeholder="Nhập tên hoặc số điện thoại">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="table-container" style="max-height: 400px; overflow: auto;">
        <table mat-table [dataSource]="filteredVisitors" class="w-100">
          <ng-container matColumnDef="fullName">
            <th mat-header-cell *matHeaderCellDef> Họ và tên </th>
            <td mat-cell *matCellDef="let element"> <strong>{{element.fullName}}</strong> </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef> SĐT </th>
            <td mat-cell *matCellDef="let element"> {{element.phone}} </td>
          </ng-container>

          <ng-container matColumnDef="idNumber">
            <th mat-header-cell *matHeaderCellDef> CCCD/ID </th>
            <td mat-cell *matCellDef="let element"> {{element.idNumber}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> </th>
            <td mat-cell *matCellDef="let element" align="end">
              <button mat-stroked-button color="primary" (click)="selectVisitor(element)">Chọn</button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <div *ngIf="filteredVisitors.length === 0" class="p-3 text-center text-muted">
          Không tìm thấy dữ liệu.
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Đóng</button>
    </mat-dialog-actions>
  `
})
export class RecentVisitorDialogComponent implements OnInit {
  visitors: VisitorDto[] = [];
  filteredVisitors: VisitorDto[] = [];
  searchText: string = '';
  displayedColumns: string[] = ['fullName', 'phone', 'idNumber', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<RecentVisitorDialogComponent>,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    this.visitorService.getRecentVisitors().subscribe({
      next: (data) => {
        this.visitors = data;
        this.filteredVisitors = data;
      },
      error: (err) => console.error('Lỗi tải khách cũ', err)
    });
  }

  filterList() {
    const term = this.searchText.toLowerCase();
    this.filteredVisitors = this.visitors.filter(v => 
      (v.fullName && v.fullName.toLowerCase().includes(term)) ||
      (v.phone && v.phone.includes(term)) ||
      (v.idNumber && v.idNumber.includes(term))
    );
  }

  selectVisitor(visitor: VisitorDto) {
    this.dialogRef.close(visitor);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}