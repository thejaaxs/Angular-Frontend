import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsApi } from '../../../api/payments.service';
import { Payment, PaymentCreateRequest } from '../../../shared/models/payment.model';
import { ToastService } from '../../../core/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomersApi } from '../../../api/customers.service';
import { Customer } from '../../../shared/models/customer.model';
import { BookingsApi } from '../../../api/bookings.service';
import { Booking } from '../../../shared/models/booking.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.css'
})
export class PaymentCreateComponent {
  model: PaymentCreateRequest = { bookingId: 0, customerId: 0, amount: 0, paymentMethod: 'UPI' };
  customers: Customer[] = [];
  bookings: Booking[] = [];
  processing = false;
  result?: Payment;

  constructor(
    private api: PaymentsApi,
    private customersApi: CustomersApi,
    private bookingsApi: BookingsApi,
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
          this.model.customerId = matched.customerId;
        } else if (this.customers[0]?.customerId) {
          this.model.customerId = this.customers[0].customerId;
        }
        if (this.model.customerId) this.loadBookings();
      },
      error: () => this.toast.error('Failed to load customers'),
    });
  }

  loadBookings() {
    if (!this.model.customerId) return;
    this.bookingsApi.byCustomer(this.model.customerId).subscribe({
      next: (res) => {
        this.bookings = res.filter((b) => b.bookingStatus !== 'CANCELLED');
        if (this.bookings[0]?.id) {
          this.selectBooking(this.bookings[0].id);
        }
      },
      error: () => this.toast.error('Failed to load bookings'),
    });
  }

  selectBooking(bookingId: number) {
    const booking = this.bookings.find((b) => b.id === Number(bookingId));
    if (!booking?.id) return;
    this.model.bookingId = booking.id;
    this.model.amount = booking.amount ?? 0;
  }

  submit() {
    if (!this.model.customerId || this.model.customerId <= 0) {
      this.toast.error('Please select a valid customer.');
      return;
    }
    if (!this.model.bookingId || this.model.bookingId <= 0) {
      this.toast.error('Please select a valid booking.');
      return;
    }
    if (!this.model.amount || this.model.amount <= 0) {
      this.toast.error('Amount must be greater than 0.');
      return;
    }

    this.processing = true;
    this.result = undefined;
    this.api.pay(this.model).subscribe({
      next: (res) => {
        this.result = res;
        const msg = `Payment ${res.paymentStatus}${res.transactionId ? ` | TXN: ${res.transactionId}` : ''}`;
        this.toast.success(msg);
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = typeof err.error === 'string' ? err.error : err.error?.message;
        if (err.status === 400) {
          this.toast.error(backendMessage || 'Payment request rejected. Verify booking/customer/amount and try again.');
          return;
        }
        this.toast.error(backendMessage || 'Payment failed');
      },
      complete: () => {
        this.processing = false;
      }
    });
  }
}

