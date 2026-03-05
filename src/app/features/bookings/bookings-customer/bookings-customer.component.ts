import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsApi } from '../../../api/bookings.service';
import { Booking } from '../../../shared/models/booking.model';
import { ToastService } from '../../../core/services/toast.service';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomersApi } from '../../../api/customers.service';
import { Customer } from '../../../shared/models/customer.model';
import { AuthService } from '../../../core/services/auth.service';
import { BadgeComponent } from '../../../shared/ui/badge.component';
import { SectionHeaderComponent } from '../../../shared/ui/section-header.component';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BadgeComponent, SectionHeaderComponent, SkeletonLoaderComponent],
  templateUrl: './bookings-customer.component.html',
  styleUrl: './bookings-customer.component.css'
})
export class BookingsCustomerComponent {
  customerId = 0;
  customers: Customer[] = [];
  list: Booking[] = [];
  loading = false;
  errorMessage = '';
  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private api: BookingsApi,
    private customersApi: CustomersApi,
    private auth: AuthService,
    private toast: ToastService
  ) {
    this.loadCustomers();
  }

  private loadCustomers() {
    this.customersApi.list().subscribe({
      next: (res) => {
        this.customers = res;
        const email = this.auth.getEmail();
        const matched = email ? this.customers.find((c) => c.email?.toLowerCase() === email.toLowerCase()) : undefined;
        if (matched?.customerId) {
          this.customerId = matched.customerId;
          this.load();
        } else if (this.customers[0]?.customerId) {
          this.customerId = this.customers[0].customerId;
        }
      },
      error: () => this.toast.error('Failed to load customers'),
    });
  }

  load() {
    this.loading = true;
    this.errorMessage = '';
    this.api.byCustomer(this.customerId).subscribe({
      next: (res) => (this.list = res),
      error: (err: HttpErrorResponse) => {
        const msg = typeof err.error === 'string' ? err.error : err.error?.message;
        this.errorMessage = msg || 'Could not load bookings.';
      },
      complete: () => (this.loading = false),
    });
  }

  canCancel(b: Booking): boolean {
    return b.bookingStatus === 'PENDING' || b.bookingStatus === 'CONFIRMED';
  }

  cancel(id: number) {
    this.api.cancel(id).subscribe({
      next: () => {
        this.toast.success('Booking cancelled');
        this.load();
      },
      error: (err: HttpErrorResponse) => this.toast.error(err.error?.message || 'Cancel failed'),
    });
  }

  bookingStatusClass(status?: string): string {
    const normalized = (status || '').toUpperCase();
    if (normalized === 'CONFIRMED') return 'badge-confirmed';
    if (normalized === 'CANCELLED') return 'badge-cancelled';
    return 'badge-pending';
  }

  paymentStatusClass(status?: string): string {
    const normalized = (status || '').toUpperCase();
    if (normalized === 'PAID') return 'badge-paid';
    return 'badge-unpaid';
  }
}

