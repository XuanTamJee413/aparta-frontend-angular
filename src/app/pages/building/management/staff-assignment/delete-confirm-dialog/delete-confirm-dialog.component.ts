import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-header">
      <h2 mat-dialog-title class="text-danger">
        <mat-icon color="warn">warning</mat-icon> {{ data.title }}
      </h2>
      <button mat-icon-button (click)="onCancel()"><mat-icon>close</mat-icon></button>
    </div>
    
    <mat-dialog-content>
      <p class="confirm-message">{{ data.message }}</p>
      <p *ngIf="data.warning" class="text-warning">{{ data.warning }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Hủy bỏ</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        {{ data.confirmText || 'Xóa' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-right: 8px; }
    .text-danger { color: #dc2626; display: flex; align-items: center; gap: 8px; margin: 0; padding: 16px 24px;}
    .confirm-message { font-size: 16px; margin-top: 10px; color: #374151; }
    .text-warning { color: #d97706; font-size: 14px; background: #fffbeb; padding: 8px; border-radius: 4px; border: 1px solid #fcd34d; }
  `]
})
export class DeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; warning?: string; confirmText?: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}