import { Component, ViewChild, inject } from '@angular/core'; // <-- Thêm 'inject'
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
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
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
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayout {

  @ViewChild('drawer') drawer!: MatSidenav;

  private isSmallScreenQuery = '(max-width: 959.98px)';
  isSmallScreen$: Observable<boolean>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private auth: AuthService
  ) {
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

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}