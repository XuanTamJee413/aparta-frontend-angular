import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Role, RoleService } from '../../../../services/admin/role.service';
import { RoleCreateDialogComponent } from '../create-role/role-create-dialog.component';
import { RoleRenameDialogComponent } from '../update-role/role-rename-dialog.component';
import { RoleDeleteDialogComponent } from '../delete-role/role-delete-dialog.component';
import { RolePermissionDialogComponent } from '../update-role/role-permission-dialog.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles = signal<Role[]>([]);
  loading = signal(false);
  // Sorting state
  sortMode = signal<'name' | 'system'>('name');
  sortDir = signal<'asc' | 'desc'>('asc'); // applies to name mode
  systemFirst = signal<boolean>(true); // applies to system mode

  constructor(
    private readonly roleService: RoleService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getRoles().subscribe(res => {
      this.roles.set(res.data ?? []);
      this.loading.set(false);
    }, _ => this.loading.set(false));
  }

  // Sorted view
  sortedRoles(): Role[] {
    const list = [...(this.roles() ?? [])];
    const mode = this.sortMode();
    if (mode === 'name') {
      const dir = this.sortDir();
      return list.sort((a, b) => {
        const cmp = a.roleName.localeCompare(b.roleName, undefined, { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      });
    } else {
      const firstSystem = this.systemFirst();
      return list.sort((a, b) => {
        if (a.isSystemDefined === b.isSystemDefined) {
          // secondary by name asc for stability
          return a.roleName.localeCompare(b.roleName, undefined, { sensitivity: 'base' });
        }
        return firstSystem
          ? (a.isSystemDefined ? -1 : 1)
          : (a.isSystemDefined ? 1 : -1);
      });
    }
  }

  setSortByName(dir: 'asc' | 'desc'): void {
    this.sortMode.set('name');
    this.sortDir.set(dir);
  }

  setSortBySystem(systemFirst: boolean): void {
    this.sortMode.set('system');
    this.systemFirst.set(systemFirst);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(RoleCreateDialogComponent, { width: '420px' });
    ref.afterClosed().subscribe(name => {
      if (typeof name === 'string' && name.trim().length >= 3) {
        this.roleService.createRole(name.trim()).subscribe(res => {
          this.snackBar.open(res?.message ?? 'Tạo role thành công', 'Đóng', { duration: 3000 });
          this.loadRoles();
        }, err => this.snackBar.open(err?.error?.message || 'Tạo role thất bại', 'Đóng', { duration: 4000 }));
      }
    });
  }

  openRenameDialog(role: Role): void {
    const ref = this.dialog.open(RoleRenameDialogComponent, {
      width: '420px',
      data: { role }
    });
    ref.afterClosed().subscribe(newName => {
      if (typeof newName === 'string' && newName.trim().length >= 3 && newName.trim() !== role.roleName) {
        this.roleService.updateRole(role.roleId, newName.trim()).subscribe(res => {
          this.snackBar.open(res?.message ?? 'Cập nhật role thành công', 'Đóng', { duration: 3000 });
          this.loadRoles();
        }, err => this.snackBar.open(err?.error?.message || 'Cập nhật role thất bại', 'Đóng', { duration: 4000 }));
      }
    });
  }

  confirmDelete(role: Role): void {
    const ref = this.dialog.open(RoleDeleteDialogComponent, {
      width: '420px',
      data: { role }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok === true) {
        this.roleService.deleteRole(role.roleId).subscribe(res => {
          this.snackBar.open(res?.message ?? 'Xóa role thành công', 'Đóng', { duration: 3000 });
          this.loadRoles();
        }, err => this.snackBar.open(err?.error?.message || 'Xóa role thất bại', 'Đóng', { duration: 4000 }));
      }
    });
  }

  managePermissions(role: Role): void {
    const ref = this.dialog.open(RolePermissionDialogComponent, {
      width: '720px',
      data: { role }
    });
    ref.afterClosed().subscribe((res) => {
      if (!res) return;
      const message = res?.message ?? (res?.succeeded ? 'Lưu quyền thành công' : 'Lưu quyền thất bại');
      this.snackBar.open(message, 'Đóng', { duration: 3000 });
    });
  }
}
