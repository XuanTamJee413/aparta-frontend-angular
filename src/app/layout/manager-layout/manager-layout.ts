import { Component, ViewChild, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenu } from '@angular/material/menu';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manager-layout', 
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './manager-layout.html', 
  styleUrls: ['./manager-layout.css']  
})
export class ManagerLayout {

  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChild('userMenuRef') userMenu!: MatMenu;

  private isSmallScreenQuery = '(max-width: 959.98px)';
  isSmallScreen$: Observable<boolean>;

  auth = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  
  constructor() {
    this.isSmallScreen$ = this.breakpointObserver.observe(this.isSmallScreenQuery)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  closeSidenavOnMobile(): void {
    if (this.breakpointObserver.isMatched(this.isSmallScreenQuery)) {
      this.drawer.close();
    }
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}