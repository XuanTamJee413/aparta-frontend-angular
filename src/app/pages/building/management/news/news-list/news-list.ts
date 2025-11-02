import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { News, NewsService } from '../../../../../services/building/news.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './news-list.html',
  styleUrls: ['./news-list.css']
})
export class NewsListComponent implements OnInit {
  newsList: News[] = [];
  filteredNews: News[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  statusFilter = '';

  statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'delete', label: 'Deleted' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 0;

  constructor(
    private newsService: NewsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading = true;
    this.errorMessage = '';

    // Check token before making request
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.loading = false;
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.newsService.getAllNews(this.searchTerm, this.statusFilter).subscribe({
      next: (response) => {
        if (response && response.succeeded !== false) {
          // Handle response data - could be array, single object, or null
          if (response.data) {
            if (Array.isArray(response.data)) {
              this.newsList = response.data;
            } else {
              this.newsList = [response.data];
            }
          } else {
            this.newsList = [];
          }
          this.filteredNews = [...this.newsList];
          this.updatePagination();
        } else {
          this.errorMessage = response?.message || 'Không thể tải danh sách tin tức';
          this.newsList = [];
          this.filteredNews = [];
        }
        this.loading = false;
      },
      error: (error) => {
        // Handle specific error codes
        if (error.status === 403) {
          const hasCanReadNews = this.authService.hasPermission('CanReadNews');
          if (!hasCanReadNews) {
            this.errorMessage = 'Bạn không có quyền "CanReadNews" để xem danh sách tin tức. Vui lòng liên hệ quản trị viên để được cấp quyền.';
          } else {
            this.errorMessage = 'Bạn không có quyền truy cập. Vui lòng kiểm tra lại token hoặc đăng nhập lại.';
          }
          
          if (!this.authService.isAuthenticated()) {
            this.authService.logout();
            this.router.navigate(['/login']);
            return;
          }
        } else if (error.status === 401) {
          this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else {
          this.errorMessage = error.error?.message || error.message || 'Đã xảy ra lỗi khi tải danh sách tin tức';
        }
        
        this.loading = false;
        this.newsList = [];
        this.filteredNews = [];
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadNews();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadNews();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadNews();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNews.length / this.itemsPerPage);
  }

  get paginatedNews(): News[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredNews.slice(startIndex, endIndex);
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

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: string | null): string {
    if (!status || status === null) return 'None';
    return status === 'active' ? 'Active' : status === 'draft' ? 'Draft' : status === 'delete' ? 'Deleted' : 'Unknown';
  }
}
