import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsApi } from '../../../api/reviews.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ReviewCreateRequest } from '../../../shared/models/review.model';
import { CustomersApi } from '../../../api/customers.service';
import { Customer } from '../../../shared/models/customer.model';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './review-create.component.css',
  template: `
    <section class="page-card page-shell">
      <article class="card">
        <h2>Create Review</h2>
        <p class="section-subtitle">Share product experience and help other buyers.</p>

        <form (ngSubmit)="submit()" #f="ngForm">
          <label>Customer</label>
          <select [(ngModel)]="model.customerId" name="customerId" required>
            <option *ngFor="let c of customers" [ngValue]="c.customerId">
              {{ c.customerId }} - {{ c.customerName }} ({{ c.email }})
            </option>
          </select>

          <label>Product Name</label>
          <input [(ngModel)]="model.productName" name="productName" required maxlength="120" />

          <label>Rating</label>
          <div class="rating-field">
            <input class="rating-input" type="number" [(ngModel)]="model.rating" name="rating" required min="1" max="10" step="1" />
            <small>1-10</small>
          </div>

          <label>Title</label>
          <input [(ngModel)]="model.title" name="title" maxlength="200" />

          <label>Comment</label>
          <textarea [(ngModel)]="model.comment" name="comment" maxlength="2000"></textarea>

          <button class="btn" type="submit" [disabled]="f.invalid || saving">{{ saving ? 'Saving...' : 'Save' }}</button>
        </form>
      </article>
    </section>
  `
})
export class ReviewCreateComponent {
  model: ReviewCreateRequest = { customerId: 0, productName: '', rating: 8, title: '', comment: '' };
  customers: Customer[] = [];
  saving = false;

  constructor(
    private api: ReviewsApi,
    private customersApi: CustomersApi,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    const productName = this.route.snapshot.queryParamMap.get('productName');
    if (productName) {
      this.model.productName = productName;
    }
    this.loadCustomers();
  }

  private loadCustomers() {
    this.customersApi.list().subscribe({
      next: (res) => {
        this.customers = res;
        const email = this.auth.getEmail();
        const matched = email ? this.customers.find((c) => c.email?.toLowerCase() === email.toLowerCase()) : undefined;
        if (matched?.customerId) {
          this.model.customerId = matched.customerId;
        } else if (this.customers[0]?.customerId) {
          this.model.customerId = this.customers[0].customerId;
        }
      },
      error: () => this.toast.error('Failed to load customers'),
    });
  }

  submit() {
    if (this.model.rating < 1 || this.model.rating > 10) {
      this.toast.error('Rating must be between 1 and 10.');
      return;
    }

    this.saving = true;
    this.api.add(this.model).subscribe({
      next: () => {
        this.toast.success('Review created');
        this.router.navigateByUrl('/customer/reviews');
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = typeof err.error === 'string' ? err.error : err.error?.message;
        this.toast.error(backendMessage || 'Review creation failed');
      },
      complete: () => {
        this.saving = false;
      }
    });
  }
}

