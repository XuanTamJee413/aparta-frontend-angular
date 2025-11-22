import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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
  selector: 'app-resident-layout',
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
  templateUrl: './resident-layout.component.html',
  styleUrls: ['./resident-layout.component.css']  
})
export class ResidentLayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChild('userMenuRef') userMenu!: MatMenu;

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
        shareReplay(1),
        catchError(error => {
          console.error('Error in breakpoint observer:', error);
          return of(false);
        })
      );
  }

  ngOnInit(): void {
    try {
      console.log('ResidentLayoutComponent initialized');
    } catch (error) {
      console.error('Error initializing ResidentLayoutComponent:', error);
    }
  }

  ngAfterViewInit(): void {
    // Đảm bảo drawer được khởi tạo đúng cách
    try {
      if (this.drawer) {
        // Sidenav đã sẵn sàng
        console.log('Sidenav initialized');
      }
    } catch (error) {
      console.error('Error initializing sidenav:', error);
    }
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