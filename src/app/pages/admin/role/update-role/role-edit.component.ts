import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs/operators';
import { Permission, Role, RoleService } from '../../../../services/admin/role.service';

export interface GroupedPermission {
  groupName: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.css']
})
export class RoleEditComponent implements OnInit {
  role = signal<Role | null>(null);
  groups = signal<GroupedPermission[]>([]);
  selected = signal<Set<string>>(new Set<string>());
  saving = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: RoleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.getRoleById(id).subscribe(r => this.role.set(r.data!));
    this.service.getPermissions().subscribe(pp => this.groups.set(this.groupPermissions(pp.data ?? [])));
    this.service.getPermissionsForRole(id).subscribe(res => this.selected.set(new Set(res.data?.map(p => p.permissionId))));
  }

  toggle(id: string, checked: boolean): void {
    const cur = new Set(this.selected());
    if (checked) cur.add(id); else cur.delete(id);
    this.selected.set(cur);
  }

  save(): void {
    const id = this.role()?.roleId; if (!id) return;
    this.saving.set(true);
    this.service.assignPermissionsToRole(id, Array.from(this.selected()))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe();
  }

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
