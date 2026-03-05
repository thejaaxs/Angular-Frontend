import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsApi } from '../../../api/reviews.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { Review } from '../../../shared/models/review.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './review-edit.component.css',
  template: `
    <section class="page-card page-shell">
      <article class="card">
        <h2>Edit Review</h2>
        <div class="state-card" *ngIf="!loaded">
          <div class="spinner"></div>
          <p>Loading review...</p>
        </div>

        <form *ngIf="loaded" (ngSubmit)="submit()" #f="ngForm">
          <p class="section-subtitle">Review ID: <b>{{ id }}</b></p>

          <label>Product Name</label>
          <input [(ngModel)]="model.productName" name="productName" />

          <label>Rating</label>
          <div class="rating-field">
            <input class="rating-input" type="number" [(ngModel)]="model.rating" name="rating" min="1" max="10" step="1" />
            <small>1-10</small>
          </div>

          <label>Title</label>
          <input [(ngModel)]="model.title" name="title" />

          <label>Comment</label>
          <textarea [(ngModel)]="model.comment" name="comment"></textarea>

          <button class="btn" type="submit" [disabled]="saving">{{ saving ? 'Updating...' : 'Update' }}</button>
        </form>
      </article>
    </section>
  `
})
export class ReviewEditComponent implements OnInit {
  id!: number;
  model: Partial<Review> = {};
  loaded = false;
  saving = false;

  constructor(private api: ReviewsApi, private route: ActivatedRoute, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id || Number.isNaN(this.id)) {
      this.toast.error('Invalid review id.');
      this.router.navigateByUrl('/customer/reviews');
      return;
    }
    this.api.list().subscribe({
      next: (all) => {
        const r = all.find(x => x.id === this.id);
        if (!r) {
          this.toast.error('Review not found or already deleted.');
          this.router.navigateByUrl('/customer/reviews');
          return;
        }
        this.model = { productName: r.productName, rating: r.rating, title: r.title, comment: r.comment };
        this.loaded = true;
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toast.error(backendMessage || 'Failed to load review');
        this.router.navigateByUrl('/customer/reviews');
      },
    });
  }

  submit() {
    if (typeof this.model.rating === 'number' && (this.model.rating < 1 || this.model.rating > 10)) {
      this.toast.error('Rating must be between 1 and 10.');
      return;
    }

    this.saving = true;
    this.api.update(this.id, this.model).subscribe({
      next: () => {
        this.toast.success('Updated');
        this.router.navigateByUrl('/customer/reviews');
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.toast.error('Review not found. It may have been removed.');
          this.router.navigateByUrl('/customer/reviews');
          return;
        }
        const backendMessage = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toast.error(backendMessage || 'Update failed');
      },
      complete: () => {
        this.saving = false;
      },
    });
  }
}

