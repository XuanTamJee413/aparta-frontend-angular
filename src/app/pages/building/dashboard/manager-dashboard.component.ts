import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, CategoryScale, LinearScale, BarElement, ArcElement, Legend, Tooltip, BarController, DoughnutController, LineElement, PointElement, LineController } from 'chart.js';
import { DashboardService, BuildingApartmentStatus, BuildingRevenue } from '../../../services/dashboard.service';
import { MeterReadingService } from '../../../services/operation/meter-reading.service';
import { BillingService } from '../../../services/billing.service';
import { ProfileService } from '../../../services/profile.service';
import { UserAssignmentProfileDto } from '../../../models/profile.model';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Legend, Tooltip, BarController, DoughnutController, LineElement, PointElement, LineController);

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private meterReadingService = inject(MeterReadingService);
  private billingService = inject(BillingService);
  private profileService = inject(ProfileService);

  // Overview Cards Data
  totalBuildings = 0;
  totalApartments = 0;
  soldApartments = 0;
  monthlyRevenue = 0;
  unpaidInvoices = 0;
  pendingMeterReadings = 0;
  loading = true;

  managedBuildings: UserAssignmentProfileDto[] = [];
  managedBuildingIds: string[] = [];

  // Revenue Chart Data
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: [],
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#334155',
          font: {
            size: 12,
            weight: 'normal'
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(79, 70, 229, 0.5)',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            if (value === null || value === undefined) {
              return '';
            }
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
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(79, 70, 229, 0.1)'
        },
        border: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          },
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', {
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(Number(value));
          }
        }
      }
    }
  };

  loadingRevenue = false;
  
  // Apartment Status Details
  showApartmentStatusDetails = false;
  projectDetails: BuildingApartmentStatus[] = [];
  loadingProjectDetails = false;
  apartmentStatusChartDataMap: Map<string, ChartConfiguration<'doughnut'>['data']> = new Map();
  
  // Pagination for apartment status charts
  currentApartmentPage = 1;
  apartmentItemsPerPage = 3;
  
  showRevenueDetails = false;
  revenueProjectDetails: BuildingRevenue[] = [];
  loadingRevenueDetails = false;
  projectChartDataMap: Map<string, ChartConfiguration<'line'>['data']> = new Map();
  
  // Pagination for project charts
  currentPage = 1;
  itemsPerPage = 3;

  // Apartment Status Chart (Doughnut)
  apartmentStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
    // Đã Bán + Đang Thuê được gom chung vào một nhóm "Đang sử dụng"
    labels: ['Đang sử dụng', 'Chưa bán'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(203, 213, 225, 0.8)'
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(203, 213, 225, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  apartmentStatusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#334155',
          font: {
            size: 12
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(79, 70, 229, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadManagedBuildingsAndInit();
  }

  private loadManagedBuildingsAndInit(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        const assignments = res.succeeded ? (res.data?.currentAssignments || []) : [];
        // Với manager: dùng currentAssignments để xác định building được phép xem
        this.managedBuildings = assignments;
        this.managedBuildingIds = assignments.map(a => a.buildingId).filter(Boolean);
        this.totalBuildings = this.managedBuildingIds.length;

        // Dashboard endpoints đã được BE filter theo manager
        this.loadAvailableYears();
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error loading profile for manager dashboard:', err);
        // Fallback: vẫn tải dashboard (nếu BE đã filter theo token) nhưng không có danh sách building để loop
        this.managedBuildings = [];
        this.managedBuildingIds = [];
        this.totalBuildings = 0;
        this.loadAvailableYears();
        this.loadDashboardData();
      }
    });
  }

  loadAvailableYears(): void {
    this.dashboardService.getAvailableYears().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.availableYears = response.data;
          if (this.availableYears.length > 0 && !this.availableYears.includes(this.selectedYear)) {
            this.selectedYear = this.availableYears[this.availableYears.length - 1]; // Latest year
          }
          this.loadRevenueChart();
        }
      },
      error: (error) => {
        console.error('Error loading available years:', error);
        // Fallback to current year
        this.selectedYear = new Date().getFullYear();
        this.availableYears = [this.selectedYear];
        this.loadRevenueChart();
      }
    });
  }

  onYearChange(): void {
    this.loadRevenueChart();
  }

  loadRevenueChart(): void {
    this.loadingRevenue = true;
    // Tổng quan doanh thu theo tháng dựa trên các tòa nhà mà manager/staff đang quản lý
    this.dashboardService.getRevenueByBuilding(this.selectedYear).subscribe({
      next: (response) => {
        const projects = response?.data || [];
        if (response.succeeded) {
          // Create chart data for 12 months
          const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
          const monthLabels = months.map(month => {
            const monthNum = parseInt(month);
            return `Tháng ${monthNum}`;
          });

          // Aggregate revenue across managed buildings for each month
          const revenueData = months.map((month, idx) => {
            const monthKey = `${month}/${this.selectedYear}`;
            return projects.reduce((sum, project) => {
              const found = project.revenueByMonth.find((r: any) => r.month === monthKey);
              return sum + (found?.revenue || 0);
            }, 0);
          });

          // Update chart + monthly revenue card (current month)
          this.revenueChartData.labels = monthLabels;
          this.revenueChartData.datasets[0].data = revenueData;
          const currentMonthIdx = new Date().getMonth(); // 0-based
          this.monthlyRevenue = revenueData[currentMonthIdx] || 0;
        }
        this.loadingRevenue = false;
      },
      error: (error) => {
        console.error('Error loading revenue chart:', error);
        this.loadingRevenue = false;
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load statistics
    this.dashboardService.getStatistics().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          const data = response.data;
          
          // Update overview cards (some will be overridden by filtered calculations)
          this.totalBuildings = this.managedBuildingIds.length || data.totalBuildings;
          this.pendingMeterReadings = data.pendingMeterReadings || 0;
          this.unpaidInvoices = data.unpaidInvoices || 0;
        }
        // After basic stats, load filtered aggregates
        this.loadApartmentStatusAggregate();
        this.loadAdditionalData();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private loadApartmentStatusAggregate(): void {
    this.dashboardService.getApartmentStatusByProject().subscribe({
      next: (response) => {
        const projects = response?.data || [];
        if (response.succeeded) {
          const totalSold = projects.reduce((sum, p) => sum + (p.soldApartments || 0), 0);
          const totalUnsold = projects.reduce((sum, p) => sum + (p.unsoldApartments || 0), 0);
          const total = projects.reduce((sum, p) => sum + (p.totalApartments || 0), 0);

          this.totalApartments = total;
          this.soldApartments = totalSold;

          // Update apartment status chart (overall view)
          this.apartmentStatusChartData.datasets[0].data = [
            totalSold,
            totalUnsold
          ];
        }
      },
      error: (error) => {
        console.error('Error loading apartment status aggregate:', error);
      }
    });
  }

  loadAdditionalData(): void {
    // Load additional counts based only on buildings managed by current manager
    const buildingIds = this.managedBuildingIds;
    if (!buildingIds || buildingIds.length === 0) {
      this.soldApartments = 0;
      this.loading = false;
      return;
    }

    const apartmentPromises = buildingIds.map(buildingId =>
      this.meterReadingService.getApartmentsForBuilding(buildingId).toPromise()
    );

    Promise.all(apartmentPromises).then(results => {
      let totalRented = 0;
      results.forEach(response => {
        if (response?.succeeded && response.data) {
          totalRented += response.data.length;
        }
      });

      // NOTE: endpoint trả về căn hộ "Đã thuê"; hiện UI đang label "đã bán"
      this.soldApartments = totalRented;
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }

  toggleApartmentStatusDetails(): void {
    this.showApartmentStatusDetails = !this.showApartmentStatusDetails;
    if (this.showApartmentStatusDetails && this.projectDetails.length === 0) {
      this.loadProjectDetails();
    }
    // Reset to first page when toggling
    if (this.showApartmentStatusDetails) {
      this.currentApartmentPage = 1;
    }
  }

  loadProjectDetails(): void {
    this.loadingProjectDetails = true;
    this.dashboardService.getApartmentStatusByBuilding().subscribe({
      next: (response) => {
        const projects = response?.data || [];
        if (response.succeeded) {
          this.projectDetails = projects;
          this.buildApartmentStatusCharts();
        }
        this.loadingProjectDetails = false;
      },
      error: (error) => {
        console.error('Error loading project details:', error);
        this.loadingProjectDetails = false;
      }
    });
  }

  buildApartmentStatusCharts(): void {
    this.apartmentStatusChartDataMap.clear();
    
    this.projectDetails.forEach(project => {
      // Nếu chưa có căn hộ, hiển thị 100% chưa bán
      let soldCount = project.soldApartments;
      let unsoldCount = project.unsoldApartments;
      
      if (project.totalApartments === 0) {
        soldCount = 0;
        unsoldCount = 1; // Đặt 1 để chart hiển thị 100% chưa bán
      }
      
      const chartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: ['Đã Bán', 'Chưa bán'],
        datasets: [
          {
            data: [soldCount, unsoldCount],
            backgroundColor: [
              'rgba(79, 70, 229, 0.8)',
              'rgba(203, 213, 225, 0.8)'
            ],
            borderColor: [
              'rgba(79, 70, 229, 1)',
              'rgba(203, 213, 225, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 8
          }
        ]
      };
      
      this.apartmentStatusChartDataMap.set(project.buildingId, chartData);
    });
  }

  getApartmentStatusChartData(projectId: string): ChartConfiguration<'doughnut'>['data'] | undefined {
    return this.apartmentStatusChartDataMap.get(projectId);
  }

  getApartmentStatusChartOptions(): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#334155',
            font: {
              size: 11
            },
            padding: 10
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 10,
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(79, 70, 229, 0.5)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  toggleRevenueDetails(): void {
    this.showRevenueDetails = !this.showRevenueDetails;
    if (this.showRevenueDetails && this.revenueProjectDetails.length === 0) {
      this.loadRevenueDetails();
    }
    // Reset to first page when toggling
    if (this.showRevenueDetails) {
      this.currentPage = 1;
    }
  }

  loadRevenueDetails(): void {
    this.loadingRevenueDetails = true;
    this.dashboardService.getRevenueByBuilding(this.selectedYear).subscribe({
      next: (response) => {
        const projects = response?.data || [];
        if (response.succeeded) {
          this.revenueProjectDetails = projects;
          this.buildProjectCharts();
        }
        this.loadingRevenueDetails = false;
      },
      error: (error) => {
        console.error('Error loading revenue details:', error);
        this.loadingRevenueDetails = false;
      }
    });
  }

  buildProjectCharts(): void {
    this.projectChartDataMap.clear();
    
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthLabels = months.map(month => {
      const monthNum = parseInt(month);
      return `T${monthNum}`;
    });

    this.revenueProjectDetails.forEach(project => {
      const revenueData = project.revenueByMonth.map((r: any) => r.revenue);
      
      const chartData: ChartConfiguration<'line'>['data'] = {
        labels: monthLabels,
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: revenueData,
            borderColor: 'rgba(79, 70, 229, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: 'rgba(79, 70, 229, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
          }
        ]
      };
      
      this.projectChartDataMap.set(project.buildingId, chartData);
    });
  }

  getProjectChartData(projectId: string): ChartConfiguration<'line'>['data'] | undefined {
    return this.projectChartDataMap.get(projectId);
  }

  getProjectChartOptions(): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 8,
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(79, 70, 229, 0.5)',
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              if (value === null || value === undefined) {
                return '';
              }
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
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 10
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(79, 70, 229, 0.1)'
          },
          border: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 10
            },
            callback: function(value) {
              return new Intl.NumberFormat('vi-VN', {
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(Number(value));
            }
          }
        }
      }
    };
  }

  getMonthName(month: string): string {
    const monthNum = parseInt(month.split('/')[0]);
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return monthNames[monthNum - 1] || month;
  }

  getTotalRevenue(): number {
    if (!this.revenueChartData.datasets[0].data || this.revenueChartData.datasets[0].data.length === 0) {
      return 0;
    }
    return (this.revenueChartData.datasets[0].data as number[]).reduce((sum: number, r: number) => sum + (r || 0), 0);
  }

  getTotalRevenueByMonth(monthIndex: number): number {
    return this.revenueProjectDetails.reduce((sum, p) => {
      const monthRevenue = p.revenueByMonth[monthIndex]?.revenue || 0;
      return sum + monthRevenue;
    }, 0);
  }

  getTotalRevenueAllProjects(): number {
    return this.revenueProjectDetails.reduce((sum, p) => sum + p.totalRevenue, 0);
  }

  // Pagination methods
  get paginatedProjects(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.revenueProjectDetails.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.revenueProjectDetails.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Apartment Status Pagination methods
  get paginatedApartmentProjects(): BuildingApartmentStatus[] {
    const startIndex = (this.currentApartmentPage - 1) * this.apartmentItemsPerPage;
    const endIndex = startIndex + this.apartmentItemsPerPage;
    return this.projectDetails.slice(startIndex, endIndex);
  }

  get totalApartmentPages(): number {
    return Math.ceil(this.projectDetails.length / this.apartmentItemsPerPage);
  }

  goToApartmentPage(page: number): void {
    if (page >= 1 && page <= this.totalApartmentPages) {
      this.currentApartmentPage = page;
    }
  }

  previousApartmentPage(): void {
    if (this.currentApartmentPage > 1) {
      this.currentApartmentPage--;
    }
  }

  nextApartmentPage(): void {
    if (this.currentApartmentPage < this.totalApartmentPages) {
      this.currentApartmentPage++;
    }
  }

  getApartmentPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentApartmentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalApartmentPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}

