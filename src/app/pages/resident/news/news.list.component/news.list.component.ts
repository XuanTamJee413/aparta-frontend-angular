import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { News, NewsService } from '../../../../services/building/news.service';


@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.list.component.html',
  styleUrl: './news.list.component.css'
})
export class NewsListComponent implements OnInit {

  newsList: News[] = [];
  loading = true;

  constructor(
    private newsService: NewsService,
    private router: Router
  ) {}

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

  getPriority(status: string | null): string {
    if (!status) return 'medium';
    return status.toLowerCase(); // high/medium/low
  }

  viewDetail(id: string) {
    this.router.navigate(['/news', id]);
  }
}
