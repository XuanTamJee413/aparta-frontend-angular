import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';
import { Permission, Role, RoleService } from '../../../../services/admin/role.service';

interface GroupedPermission {
  groupName: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-permission-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './role-permission-dialog.component.html',
  styleUrls: ['./role-permission-dialog.component.css']
})
export class RolePermissionDialogComponent implements OnInit {
  role = signal<Role | null>(null);
  groups = signal<GroupedPermission[]>([]);
  selected = signal<Set<string>>(new Set<string>());
  saving = signal(false);
  loading = signal(true);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { role: Role },
    private readonly dialogRef: MatDialogRef<RolePermissionDialogComponent>,
    private readonly service: RoleService
  ) {}

  ngOnInit(): void {
    this.role.set(this.data.role);
    const id = this.data.role.roleId;
    this.service.getPermissions()
      .subscribe(pp => {
        this.groups.set(this.groupPermissions(pp.data ?? []));
      });
    this.service.getPermissionsForRole(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(res => {
        this.selected.set(new Set(res.data?.map(p => p.permissionId)));
      });
  }

  toggle(id: string, checked: boolean): void {
    const cur = new Set(this.selected());
    if (checked) cur.add(id); else cur.delete(id);
    this.selected.set(cur);
  }

  save(): void {
    const r = this.role(); if (!r) return;
    this.saving.set(true);
    this.service.assignPermissionsToRole(r.roleId, Array.from(this.selected()))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe(res => {
        this.dialogRef.close(res);
      }, err => {
        const message = err?.error?.message || 'Lưu quyền thất bại';
        this.dialogRef.close({ succeeded: false, message });
      });
  }

  close(): void { this.dialogRef.close(); }

  private groupPermissions(permissions: Permission[]): GroupedPermission[] {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const g = p.groupName || 'Khác';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
    }
    return Array.from(map.entries()).map(([groupName, perms]) => ({ groupName, permissions: perms }));
  }
}
