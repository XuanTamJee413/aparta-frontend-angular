import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateNewsRequest, NewsService } from '../../../../../services/building/news.service';

@Component({
  selector: 'app-news-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './news-create.html',
  styleUrls: ['./news-create.css']
})
export class NewsCreateComponent {
  news: CreateNewsRequest = {
    title: '',
    content: ''
  };

  submitting = false;
  errorMessage = '';

  constructor(
    private newsService: NewsService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.submitting) return;

    this.submitting = true;
    this.errorMessage = '';

    this.newsService.createNews(this.news).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.router.navigate(['/manager/news/list']);
        } else {
          this.errorMessage = response.message || 'Failed to create news';
          this.submitting = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred while creating news';
        this.submitting = false;
        console.error('Error creating news:', error);
      }
    });
  }
}
