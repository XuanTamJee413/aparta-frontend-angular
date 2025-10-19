import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav id="sidebar" class="sidebar js-sidebar">
      <div class="sidebar-content js-simplebar">
        <a class="sidebar-brand" href="#">
          <span class="sidebar-brand-text align-middle">
            AdminKit
            <sup><small class="badge bg-primary text-uppercase">Pro</small></sup>
          </span>
          <svg class="sidebar-brand-icon align-middle" width="32px" height="32px" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" color="#FFFFFF" style="margin-left: -3px">
            <path d="M12 4L20 8.00004L12 12L4 8.00004L12 4Z"></path>
            <path d="M20 12L12 16L4 12"></path>
            <path d="M20 16L12 20L4 16"></path>
          </svg>
        </a>

        <div class="sidebar-user">
          <div class="d-flex justify-content-center">
            <div class="flex-shrink-0">
              <img src="assets/img/avatars/avatar.jpg" class="avatar img-fluid rounded me-1" alt="Charles Hall" />
            </div>
            <div class="flex-grow-1 ps-2">
              <a class="sidebar-user-title dropdown-toggle" href="#" data-bs-toggle="dropdown">
                Charles Hall
              </a>
              <div class="dropdown-menu dropdown-menu-start">
                <a class="dropdown-item" href="#">
                  <i class="align-middle me-1" data-feather="user"></i> Profile
                </a>
                <a class="dropdown-item" href="#">
                  <i class="align-middle me-1" data-feather="pie-chart"></i> Analytics
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#">
                  <i class="align-middle me-1" data-feather="settings"></i> Settings & Privacy
                </a>
                <a class="dropdown-item" href="#">
                  <i class="align-middle me-1" data-feather="help-circle"></i> Help Center
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#">Log out</a>
              </div>
              <div class="sidebar-user-subtitle">Designer</div>
            </div>
          </div>
        </div>

        <ul class="sidebar-nav">
          <li class="sidebar-header">
            Pages
          </li>
          
          <li class="sidebar-item">
            <a data-bs-target="#dashboards" data-bs-toggle="collapse" class="sidebar-link">
              <i class="align-middle" data-feather="sliders"></i> 
              <span class="align-middle">Dashboards</span>
            </a>
            <ul id="dashboards" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/dashboard">Analytics</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ecommerce">E-Commerce 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/crypto">Crypto 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
            </ul>
          </li>

          <li class="sidebar-item">
            <a data-bs-target="#pages" data-bs-toggle="collapse" class="sidebar-link collapsed">
              <i class="align-middle" data-feather="layout"></i> 
              <span class="align-middle">Pages</span>
            </a>
            <ul id="pages" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/settings">Settings</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/projects">Projects 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/clients">Clients 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/pricing">Pricing 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/chat">Chat 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/blank">Blank Page</a>
              </li>
            </ul>
          </li>

          <li class="sidebar-item">
            <a class="sidebar-link" routerLink="/admin/profile">
              <i class="align-middle" data-feather="user"></i> 
              <span class="align-middle">Profile</span>
            </a>
          </li>

          <li class="sidebar-item">
            <a class="sidebar-link" routerLink="/admin/invoice">
              <i class="align-middle" data-feather="credit-card"></i> 
              <span class="align-middle">Invoice</span>
            </a>
          </li>

          <li class="sidebar-item">
            <a class="sidebar-link" routerLink="/admin/tasks">
              <i class="align-middle" data-feather="list"></i> 
              <span class="align-middle">Tasks</span>
              <span class="sidebar-badge badge bg-primary">Pro</span>
            </a>
          </li>

          <li class="sidebar-item">
            <a class="sidebar-link" routerLink="/admin/calendar">
              <i class="align-middle" data-feather="calendar"></i> 
              <span class="align-middle">Calendar</span>
              <span class="sidebar-badge badge bg-primary">Pro</span>
            </a>
          </li>

          <li class="sidebar-header">
            Project Management
          </li>

          <li class="sidebar-item">
            <a data-bs-target="#project-management" data-bs-toggle="collapse" class="sidebar-link collapsed">
              <i class="align-middle" data-feather="folder"></i> 
              <span class="align-middle">Projects</span>
            </a>
            <ul id="project-management" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/project/list">Project List</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/project/create">Create Project</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/project/categories">Categories</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/project/reports">Reports</a>
              </li>
            </ul>
          </li>

          <li class="sidebar-header">
            Components
          </li>
          
          <li class="sidebar-item">
            <a data-bs-target="#ui" data-bs-toggle="collapse" class="sidebar-link collapsed">
              <i class="align-middle" data-feather="briefcase"></i> 
              <span class="align-middle">UI Elements</span>
            </a>
            <ul id="ui" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ui/alerts">Alerts</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ui/buttons">Buttons</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ui/cards">Cards</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ui/general">General</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ui/grid">Grid</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ui/modals">Modals</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/ui/typography">Typography</a>
              </li>
            </ul>
          </li>
          
          <li class="sidebar-item">
            <a data-bs-target="#forms" data-bs-toggle="collapse" class="sidebar-link collapsed">
              <i class="align-middle" data-feather="check-circle"></i> 
              <span class="align-middle">Forms</span>
            </a>
            <ul id="forms" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/forms/basic">Basic Inputs</a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/forms/layouts">Form Layouts 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a class="sidebar-link" routerLink="/admin/forms/input-groups">Input Groups 
                  <span class="sidebar-badge badge bg-primary">Pro</span>
                </a>
              </li>
            </ul>
          </li>
          
          <li class="sidebar-item">
            <a class="sidebar-link" routerLink="/admin/tables">
              <i class="align-middle" data-feather="list"></i> 
              <span class="align-middle">Tables</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-cta">
          <div class="sidebar-cta-content">
            <strong class="d-inline-block mb-2">Weekly Sales Report</strong>
            <div class="mb-3 text-sm">
              Your weekly sales report is ready for download!
            </div>
            <div class="d-grid">
              <a href="#" class="btn btn-outline-primary" target="_blank">Download</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class SidebarComponent {}
