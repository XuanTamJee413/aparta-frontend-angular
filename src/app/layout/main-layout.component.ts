import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="wrapper">
      <app-sidebar></app-sidebar>
      
      <div class="main">
        <app-header></app-header>
        
        <main class="content">
          <div class="container-fluid p-0">
            <router-outlet></router-outlet>
          </div>
        </main>
        
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      min-height: 100vh;
    }
    
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .content {
      flex: 1;
    }
  `]
})
export class MainLayoutComponent {}
