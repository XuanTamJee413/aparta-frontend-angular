import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-role-create-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './role-create-dialog.component.html',
  styleUrls: ['./role-create-dialog.component.css']
})
export class RoleCreateDialogComponent {
  roleName = '';

  constructor(private readonly dialogRef: MatDialogRef<RoleCreateDialogComponent>) {}

  close(): void { this.dialogRef.close(); }
  confirm(): void { this.dialogRef.close(this.roleName.trim()); }
}
