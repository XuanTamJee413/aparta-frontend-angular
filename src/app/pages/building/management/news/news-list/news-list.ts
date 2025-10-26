import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { News, NewsService } from '../../../../../services/building/news.service';

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

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading = true;
    this.errorMessage = '';

    this.newsService.getAllNews(this.searchTerm, this.statusFilter).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.newsList = response.data as News[];
          this.filteredNews = [...this.newsList];
          this.updatePagination();
        } else {
          this.errorMessage = response.message || 'Failed to load news';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while loading news';
        this.loading = false;
        console.error('Error loading news:', error);
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
