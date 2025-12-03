import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { 
  Chart, 
  ChartConfiguration, 
  ChartOptions, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Legend, 
  Tooltip, 
  BarController, 
  DoughnutController, 
  LineElement, 
  PointElement, 
  LineController 
} from 'chart.js';
import { ProjectService } from '../../../services/admin/project.service';
import { BuildingService } from '../../../services/admin/building.service';
import { ManagerService } from '../../../services/admin/manager.service';
import { SubscriptionService, SubscriptionDto } from '../../../services/admin/subscription.service';
import { forkJoin } from 'rxjs';

// Register Chart.js components
Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Legend, 
  Tooltip, 
  BarController, 
  DoughnutController, 
  LineElement, 
  PointElement, 
  LineController
);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private buildingService = inject(BuildingService);
  private managerService = inject(ManagerService);
  private subscriptionService = inject(SubscriptionService);

  // Overview Stats
  totalProjects = 0;
  activeProjects = 0;
  totalBuildings = 0;
  totalManagers = 0;
  totalSubscriptions = 0;
  activeSubscriptions = 0;
  totalRevenue = 0;
  loading = true;

  // Project Status Data (Doughnut Chart)
  projectStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Hoạt động', 'Không hoạt động'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
    }]
  };

  projectStatusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#334155',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    }
  };

  // Buildings per Project (Bar Chart)
  buildingsPerProjectChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Số tòa nhà',
      data: [],
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
    }]
  };

  buildingsPerProjectChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#334155',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#64748b',
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: { 
          color: '#64748b',
          font: { size: 11 },
          stepSize: 1
        }
      }
    }
  };

  // Subscription Status (Doughnut Chart)
  subscriptionStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Hoạt động', 'Nháp', 'Hết hạn'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
    }]
  };

  subscriptionStatusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#334155',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    }
  };

  // Subscription Revenue (Line Chart)
  subscriptionRevenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: [],
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  subscriptionRevenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#334155',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value === null || value === undefined) return '';
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value);
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#64748b',
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: { 
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => {
            return new Intl.NumberFormat('vi-VN', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value as number) + ' ₫';
          }
        }
      }
    }
  };

  // Manager Assignment (Bar Chart)
  managerAssignmentChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Số tòa nhà được quản lý',
      data: [],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2,
    }]
  };

  managerAssignmentChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#334155',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: { 
          color: '#64748b',
          font: { size: 11 },
          stepSize: 1
        }
      },
      y: {
        grid: { display: false },
        ticks: { 
          color: '#64748b',
          font: { size: 11 }
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      projects: this.projectService.getAllProjects({}),
      buildings: this.buildingService.getAllBuildings({ take: 1000 }),
      managers: this.managerService.getAllManagers(),
      subscriptions: this.subscriptionService.getAllSubscriptions({ take: 1000 })
    }).subscribe({
      next: (results) => {
        // Process Projects
        if (results.projects?.succeeded && results.projects.data) {
          const projects = results.projects.data;
          this.totalProjects = projects.length;
          this.activeProjects = projects.filter(p => p.isActive).length;
          
          // Update project status chart
          this.projectStatusChartData.datasets[0].data = [
            this.activeProjects,
            this.totalProjects - this.activeProjects
          ];
        }

        // Process Buildings
        if (results.buildings?.succeeded && results.buildings.data) {
          const buildings = results.buildings.data.items;
          this.totalBuildings = buildings.length;

          // Group buildings by project - since BuildingDto doesn't have projectName,
          // we need to match with projects data
          const projectsMap = new Map<string, string>();
          if (results.projects?.succeeded && results.projects.data) {
            results.projects.data.forEach(p => {
              projectsMap.set(p.projectId, p.name);
            });
          }

          const buildingsByProject = new Map<string, { name: string; count: number }>();
          buildings.forEach(building => {
            const projectName = projectsMap.get(building.projectId);
            if (projectName) {
              const existing = buildingsByProject.get(building.projectId);
              if (existing) {
                existing.count++;
              } else {
                buildingsByProject.set(building.projectId, {
                  name: projectName,
                  count: 1
                });
              }
            }
          });

          // Update buildings per project chart
          const sortedProjects = Array.from(buildingsByProject.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Top 8 projects
          
          this.buildingsPerProjectChartData.labels = sortedProjects.map(p => p.name);
          this.buildingsPerProjectChartData.datasets[0].data = sortedProjects.map(p => p.count);
        }

        // Process Managers
        if (results.managers?.succeeded && results.managers.data) {
          const managers = Array.isArray(results.managers.data) 
            ? results.managers.data 
            : [results.managers.data];
          this.totalManagers = managers.length;

          // Update manager assignment chart - using assignedBuildings property
          const managersWithBuildings = managers
            .filter(m => m.assignedBuildings && m.assignedBuildings.length > 0)
            .map(m => ({
              name: m.name,
              count: m.assignedBuildings.length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 managers

          this.managerAssignmentChartData.labels = managersWithBuildings.map(m => m.name);
          this.managerAssignmentChartData.datasets[0].data = managersWithBuildings.map(m => m.count);
        }

        // Process Subscriptions
        if (results.subscriptions?.succeeded && results.subscriptions.data) {
          const subscriptions = results.subscriptions.data.items;
          this.totalSubscriptions = subscriptions.length;
          this.activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;

          // Update subscription status chart
          const statusCounts = {
            Active: subscriptions.filter(s => s.status === 'Active').length,
            Draft: subscriptions.filter(s => s.status === 'Draft').length,
            Expired: subscriptions.filter(s => s.status === 'Expired').length
          };
          this.subscriptionStatusChartData.datasets[0].data = [
            statusCounts.Active,
            statusCounts.Draft,
            statusCounts.Expired
          ];

          // Calculate revenue and update revenue chart
          this.totalRevenue = subscriptions
            .filter(s => s.amountPaid)
            .reduce((sum, s) => sum + (s.amountPaid || 0), 0);

          // Group subscriptions by month for revenue chart
          const revenueByMonth = this.groupSubscriptionsByMonth(subscriptions);
          this.subscriptionRevenueChartData.labels = revenueByMonth.map(r => r.month);
          this.subscriptionRevenueChartData.datasets[0].data = revenueByMonth.map(r => r.revenue);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  groupSubscriptionsByMonth(subscriptions: SubscriptionDto[]): { month: string; revenue: number }[] {
    const monthlyRevenue = new Map<string, number>();
    const currentDate = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue.set(key, 0);
    }

    // Aggregate revenue by payment month
    subscriptions
      .filter(s => s.paymentDate && s.amountPaid)
      .forEach(s => {
        const paymentDate = new Date(s.paymentDate!);
        const key = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyRevenue.has(key)) {
          monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + (s.amountPaid || 0));
        }
      });

    return Array.from(monthlyRevenue.entries())
      .map(([key, revenue]) => {
        const [year, month] = key.split('-');
        return {
          month: `Tháng ${parseInt(month)}/${year}`,
          revenue
        };
      });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }
}
