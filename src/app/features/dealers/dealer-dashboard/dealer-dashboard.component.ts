import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingsApi } from '../../../api/bookings.service';
import { DealersApi } from '../../../api/dealers.service';
import { VehiclesApi } from '../../../api/vehicles.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-card dealer-dashboard">
      <h2>Dealer Dashboard</h2>

      <div class="state-card" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <div class="state-card error" *ngIf="!loading && errorMessage">
        <p>{{ errorMessage }}</p>
        <button type="button" (click)="load()">Retry</button>
      </div>

      <div *ngIf="!loading && !errorMessage">
        <div class="hero-card">
          <p class="summary">Dealer ID: <b>{{ dealerId }}</b></p>
          <p class="hero-subtitle">Monitor inventory and bookings in real time.</p>
        </div>

        <div class="stats-grid">
          <article class="stat-card">
            <h3>Total Vehicles</h3>
            <p>{{ totalVehicles }}</p>
          </article>
          <article class="stat-card">
            <h3>Total Bookings</h3>
            <p>{{ totalBookings }}</p>
          </article>
          <article class="stat-card">
            <h3>Pending</h3>
            <p>{{ pendingBookings }}</p>
          </article>
          <article class="stat-card">
            <h3>Confirmed</h3>
            <p>{{ confirmedBookings }}</p>
          </article>
        </div>

        <div class="actions">
          <a routerLink="/dealer/vehicles"><button type="button">Manage Vehicles</button></a>
          <a routerLink="/dealer/bookings"><button type="button">View Bookings</button></a>
          <a routerLink="/dealer/vehicles/create"><button type="button" class="ghost-btn">Add Vehicle</button></a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .dealer-dashboard {
      display: grid;
      gap: 0.9rem;
    }

    .hero-card {
      background: linear-gradient(140deg, #f0f6ff 0%, #f8fbff 100%);
      border: 1px solid #d7e3f5;
      border-radius: 14px;
      padding: 0.9rem;
      margin-bottom: 0.9rem;
    }

    .summary {
      margin: 0;
      color: #26486f;
      font-size: 0.92rem;
    }

    .hero-subtitle {
      margin: 0.2rem 0 0;
      color: #5f7c9a;
      font-size: 0.86rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.7rem;
      margin-bottom: 1.1rem;
    }

    .stat-card {
      background: #fff;
      border: 1px solid var(--mm-border);
      border-radius: 14px;
      box-shadow: var(--mm-shadow-sm);
      padding: 0.8rem;
    }

    .stat-card h3 {
      margin: 0 0 0.35rem;
      font-size: 0.93rem;
      color: #35516d;
    }

    .stat-card p {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #103050;
    }

    .actions {
      display: flex;
      gap: 0.55rem;
      flex-wrap: wrap;
    }

    .ghost-btn {
      background: #eaf2ff;
      color: #1f3e62;
    }
  `]
})
export class DealerDashboardComponent implements OnInit {
  dealerId = 0;
  totalVehicles = 0;
  totalBookings = 0;
  pendingBookings = 0;
  confirmedBookings = 0;
  loading = false;
  errorMessage = '';

  constructor(
    private dealersApi: DealersApi,
    private vehiclesApi: VehiclesApi,
    private bookingsApi: BookingsApi,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    const email = this.auth.getEmail();
    if (!email) {
      this.errorMessage = 'Dealer session is missing.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.dealersApi.list().subscribe({
      next: (dealers) => {
        const dealer = dealers.find((d) => d.email?.toLowerCase() === email.toLowerCase());
        if (!dealer?.dealerId) {
          this.errorMessage = 'Dealer profile not found for logged-in user.';
          this.loading = false;
          return;
        }

        this.dealerId = dealer.dealerId;
        forkJoin({
          vehicles: this.vehiclesApi.listByDealer(this.dealerId),
          bookings: this.bookingsApi.byDealer(this.dealerId)
        }).subscribe({
          next: ({ vehicles, bookings }) => {
            this.totalVehicles = vehicles.length;
            this.totalBookings = bookings.length;
            this.pendingBookings = bookings.filter((b) => b.bookingStatus === 'PENDING').length;
            this.confirmedBookings = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;
          },
          error: (err: HttpErrorResponse) => {
            const msg = typeof err.error === 'string' ? err.error : err.error?.message;
            this.errorMessage = msg || 'Failed to load dashboard metrics.';
          },
          complete: () => {
            this.loading = false;
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        const msg = typeof err.error === 'string' ? err.error : err.error?.message;
        this.errorMessage = msg || 'Failed to resolve dealer profile.';
        this.loading = false;
      }
    });
  }
}
