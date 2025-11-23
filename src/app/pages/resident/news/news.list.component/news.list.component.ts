import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { News, NewsService } from '../../../../services/building/news.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.list.component.html',
  styleUrl: './news.list.component.css'
})
export class NewsListComponent implements OnInit {

  @ViewChild('newsDialog') dialog!: ElementRef<HTMLDialogElement>;

  newsList: News[] = [];
  loading = true;
  selectedNews: News | null = null;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.newsService.getAllNews().subscribe({
      next: (res) => {
        if (res.succeeded && Array.isArray(res.data)) {
          this.newsList = res.data;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // Cắt nội dung ngắn gọn
  truncateContent(content: string | null | undefined, length: number = 50): string {
    if (!content) return 'Không có nội dung';
    return content.length > length ? content.substring(0, length) + '...' : content;
  }

  // Mở dialog chi tiết
  openDetail(news: News): void {
    this.selectedNews = news;
    this.dialog.nativeElement.showModal();
  }

  // Đóng dialog
  closeDialog(): void {
    this.dialog.nativeElement.close();
    this.selectedNews = null;
  }

formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Chưa có ngày';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Ngày không hợp lệ';
  
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
}