import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { News, NewsService, UpdateNewsRequest } from '../../../../../services/building/news.service';

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
    private route: ActivatedRoute
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

    this.newsService.getAllNews('', '').subscribe({
      next: (response) => {
        if (response.succeeded) {
          const newsList = response.data as News[];
          this.currentNews = newsList.find(n =>
            n.newsId.toLowerCase() === this.newsId.toLowerCase()
          ) || null;

          if (this.currentNews) {
            this.news = {
              title: this.currentNews.title,
              content: this.currentNews.content,
              status: this.currentNews.status
            };
          } else {
            this.errorMessage = 'News not found';
          }
        } else {
          this.errorMessage = response.message || 'Failed to load news data';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading news data';
        this.loading = false;
        console.error('Error loading news:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.submitting) return;

    this.submitting = true;
    this.errorMessage = '';

    this.newsService.updateNews(this.newsId, this.news).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.router.navigate(['/manager/news/list']);
        } else {
          this.errorMessage = response.message || 'Failed to update news';
          this.submitting = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while updating news';
        this.submitting = false;
        console.error('Error updating news:', error);
      }
    });
  }

  formatDate(dateString: string): string {
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
