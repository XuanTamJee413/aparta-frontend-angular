import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Role } from '../../../../services/admin/role.service';

@Component({
  selector: 'app-role-rename-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './role-rename-dialog.component.html',
  styleUrls: ['./role-rename-dialog.component.css']
})
export class RoleRenameDialogComponent {
  name = '';

  constructor(
    private readonly dialogRef: MatDialogRef<RoleRenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role: Role }
  ) {
    this.name = data.role.roleName;
  }

  close(): void { this.dialogRef.close(); }
  save(): void { this.dialogRef.close(this.name.trim()); }
}
