import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { News, NewsService, UpdateNewsRequest } from '../../../../../services/building/news.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-news-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './news-edit.html',
  styleUrls: ['./news-edit.css']
})
export class NewsEditComponent implements OnInit {
  newsId: string = '';
  currentNews: News | null = null;
  news: UpdateNewsRequest = {
    title: '',
    content: '',
    status: ''
  };

  loading = false;
  submitting = false;
  errorMessage = '';

  statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'delete', label: 'Deleted' }
  ];

  constructor(
    private newsService: NewsService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.newsId = this.route.snapshot.paramMap.get('id') || '';
    if (this.newsId) {
      this.loadNewsData();
    } else {
      this.errorMessage = 'News ID not found';
    }
  }

  loadNewsData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Check token status before making request
    const token = this.authService.getToken();
    if (!token) {
      console.warn('News Edit - No token found! User may need to login again.');
      this.errorMessage = 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.';
      this.loading = false;
      return;
    }

    // Backend doesn't have GET /api/News/{id} endpoint, so we get all news and filter by ID
    this.newsService.getAllNews('', '').subscribe({
      next: (response) => {
        console.log('News Edit - API Response:', response); // Debug log
        if (response && response.succeeded !== false) {
          // Handle response data - could be array, single object, or null
          let newsList: News[] = [];
          if (response.data) {
            if (Array.isArray(response.data)) {
              newsList = response.data;
            } else {
              newsList = [response.data as News];
            }
          }

          // Find news by ID
          this.currentNews = newsList.find(n =>
            n.newsId.toLowerCase() === this.newsId.toLowerCase()
          ) || null;

          if (this.currentNews) {
            this.news = {
              title: this.currentNews.title,
              content: this.currentNews.content,
              status: this.currentNews.status || ''
            };
            console.log('News Edit - Found news:', this.currentNews);
          } else {
            this.errorMessage = 'News not found';
            console.error('News Edit - News not found with ID:', this.newsId);
          }
        } else {
          this.errorMessage = response?.message || 'Failed to load news data';
          console.error('News Edit - Response not succeeded:', response);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('News Edit - Error loading news:', error);
        console.error('News Edit - Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });
        
        // Handle specific error codes
        if (error.status === 403) {
          const hasCanReadNews = this.authService.hasPermission('CanReadNews');
          if (!hasCanReadNews) {
            this.errorMessage = 'Bạn không có quyền "CanReadNews" để xem tin tức. Vui lòng liên hệ quản trị viên để được cấp quyền.';
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
        } else if (error.status === 405) {
          this.errorMessage = 'Phương thức không được hỗ trợ. Vui lòng thử lại.';
        } else {
          this.errorMessage = error.error?.message || error.message || 'An error occurred while loading news data';
        }
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.submitting) return;

    // Check token before submitting
    const token = this.authService.getToken();
    const isAuthenticated = this.authService.isAuthenticated();
    const user = this.authService.user();
    
    console.log('News Edit - Before submit:', {
      tokenExists: !!token,
      isAuthenticated: isAuthenticated,
      userId: user?.id,
      userRole: user?.role,
      newsId: this.newsId,
      newsAuthorId: this.currentNews?.authorUserId,
      isAuthor: user?.id?.toLowerCase() === this.currentNews?.authorUserId?.toLowerCase()
    });

    if (!token) {
      console.warn('News Edit - No token found before submit!');
      this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (!isAuthenticated) {
      console.warn('News Edit - Token invalid or expired!');
      this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.newsService.updateNews(this.newsId, this.news).subscribe({
      next: (response) => {
        console.log('News Edit - Update response:', response);
        if (response.succeeded) {
          this.router.navigate(['/manager/news/list']);
        } else {
          this.errorMessage = response.message || 'Failed to update news';
          this.submitting = false;
        }
      },
      error: (error) => {
        console.error('News Edit - Error updating news:', error);
        console.error('News Edit - Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });

        // Handle specific error codes
        if (error.status === 400) {
          // Backend validation error or business rule error
          const backendMessage = error.error?.message || error.error?.Message || '';
          if (backendMessage.includes('permission') || backendMessage.includes('author')) {
            this.errorMessage = backendMessage || 'Bạn không có quyền cập nhật tin tức này. Chỉ tác giả hoặc quản trị viên mới có thể cập nhật.';
          } else {
            this.errorMessage = backendMessage || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
          }
        } else if (error.status === 403) {
          const hasCanUpdateNews = this.authService.hasPermission('CanUpdateNews');
          if (!hasCanUpdateNews) {
            this.errorMessage = 'Bạn không có quyền "CanUpdateNews" để cập nhật tin tức. Vui lòng liên hệ quản trị viên để được cấp quyền.';
          } else {
            this.errorMessage = error.error?.message || 'Bạn không có quyền truy cập. Vui lòng kiểm tra lại token hoặc đăng nhập lại.';
          }
        } else if (error.status === 401) {
          this.errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        } else if (error.status === 404) {
          this.errorMessage = 'Tin tức không tồn tại hoặc đã bị xóa.';
        } else {
          this.errorMessage = error.error?.message || error.message || 'An error occurred while updating news';
        }

        this.submitting = false;
      }
    });
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
}
