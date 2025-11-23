// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { BaseChartDirective } from 'ng2-charts';
// import { ChartConfiguration, ChartOptions, Chart, CategoryScale, LinearScale, BarElement, ArcElement, Legend, Tooltip, BarController, DoughnutController } from 'chart.js';

// // Register Chart.js components
// Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Legend, Tooltip, BarController, DoughnutController);
// import { DashboardService } from '../../services/dashboard.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, BaseChartDirective],
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.scss'
// })
// export class DashboardComponent implements OnInit {
//   private dashboardService = inject(DashboardService);

//   // Overview Cards Data
//   totalBuildings = 0;
//   totalApartments = 0;
//   monthlyRevenue = 0;
//   occupancyRate = 0;
//   loading = true;

//   // Revenue Chart (Bar)
//   revenueChartData: ChartConfiguration<'bar'>['data'] = {
//     labels: [],
//     datasets: [
//       {
//         label: 'Doanh thu (VNĐ)',
//         data: [],
//         backgroundColor: 'rgba(20, 184, 166, 0.8)',
//         borderColor: 'rgba(20, 184, 166, 1)',
//         borderWidth: 2,
//         borderRadius: 8,
//         borderSkipped: false,
//       }
//     ]
//   };

//   revenueChartOptions: ChartOptions<'bar'> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top',
//         labels: {
//           color: '#334155',
//           font: {
//             size: 12,
//             weight: 'normal'
//           },
//           padding: 15
//         }
//       },
//       tooltip: {
//         backgroundColor: 'rgba(15, 23, 42, 0.9)',
//         padding: 12,
//         titleColor: '#fff',
//         bodyColor: '#fff',
//         borderColor: 'rgba(20, 184, 166, 0.5)',
//         borderWidth: 1,
//         displayColors: true,
//         callbacks: {
//           label: function(context) {
//             const value = context.parsed.y;
//             if (value === null || value === undefined) {
//               return '';
//             }
//             return new Intl.NumberFormat('vi-VN', {
//               style: 'currency',
//               currency: 'VND'
//             }).format(value);
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: {
//           display: false
//         },
//         ticks: {
//           color: '#64748b',
//           font: {
//             size: 11
//           }
//         }
//       },
//       y: {
//         grid: {
//           color: 'rgba(20, 184, 166, 0.1)'
//         },
//         border: {
//           display: false
//         },
//         ticks: {
//           color: '#64748b',
//           font: {
//             size: 11
//           },
//           callback: function(value) {
//             return new Intl.NumberFormat('vi-VN', {
//               notation: 'compact',
//               maximumFractionDigits: 1
//             }).format(Number(value));
//           }
//         }
//       }
//     }
//   };

//   // Apartment Status Chart (Doughnut)
//   apartmentStatusChartData: ChartConfiguration<'doughnut'>['data'] = {
//     labels: ['Đã thuê', 'Trống'],
//     datasets: [
//       {
//         data: [0, 0],
//         backgroundColor: [
//           'rgba(20, 184, 166, 0.8)',
//           'rgba(203, 213, 225, 0.8)'
//         ],
//         borderColor: [
//           'rgba(20, 184, 166, 1)',
//           'rgba(203, 213, 225, 1)'
//         ],
//         borderWidth: 2,
//         hoverOffset: 8
//       }
//     ]
//   };

//   ngOnInit(): void {
//     this.loadDashboardData();
//   }

//   loadDashboardData(): void {
//     this.loading = true;
//     this.dashboardService.getStatistics().subscribe({
//       next: (response) => {
//         console.log('Dashboard API Response:', response);
//         if (response.succeeded && response.data) {
//           const data = response.data;
//           console.log('Dashboard Data:', data);
          
//           // Update overview cards
//           this.totalBuildings = data.totalBuildings || 0;
//           this.totalApartments = data.totalApartments || 0;
//           this.monthlyRevenue = data.monthlyRevenue || 0;
//           this.occupancyRate = data.occupancyRate || 0;

//           // Update revenue chart
//           if (data.revenueByMonth && data.revenueByMonth.length > 0) {
//             this.revenueChartData = {
//               ...this.revenueChartData,
//               labels: data.revenueByMonth.map(r => `Tháng ${r.month.split('/')[0]}`),
//               datasets: [{
//                 ...this.revenueChartData.datasets[0],
//                 data: data.revenueByMonth.map(r => r.revenue)
//               }]
//             };
//           }

//           // Update apartment status chart
//           if (data.apartmentStatus) {
//             this.apartmentStatusChartData = {
//               ...this.apartmentStatusChartData,
//               datasets: [{
//                 ...this.apartmentStatusChartData.datasets[0],
//                 data: [data.apartmentStatus.occupied || 0, data.apartmentStatus.vacant || 0]
//               }]
//             };
//           }
//         } else {
//           console.warn('Dashboard API response failed:', response.message);
//         }
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading dashboard data:', error);
//         console.error('Error details:', {
//           status: error.status,
//           statusText: error.statusText,
//           error: error.error,
//           message: error.message
//         });
//         this.loading = false;
//       }
//     });
//   }

//   apartmentStatusChartOptions: ChartOptions<'doughnut'> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'bottom',
//         labels: {
//           color: '#334155',
//           font: {
//             size: 12,
//             weight: 'normal'
//           },
//           padding: 15,
//           usePointStyle: true,
//           pointStyle: 'circle'
//         }
//       },
//       tooltip: {
//         backgroundColor: 'rgba(15, 23, 42, 0.9)',
//         padding: 12,
//         titleColor: '#fff',
//         bodyColor: '#fff',
//         borderColor: 'rgba(20, 184, 166, 0.5)',
//         borderWidth: 1,
//         displayColors: true,
//         callbacks: {
//           label: function(context) {
//             const label = context.label || '';
//             const value = context.parsed || 0;
//             const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
//             const percentage = ((value / total) * 100).toFixed(1);
//             return `${label}: ${value} căn hộ (${percentage}%)`;
//           }
//         }
//       }
//     },
//     cutout: '60%'
//   };
// }
