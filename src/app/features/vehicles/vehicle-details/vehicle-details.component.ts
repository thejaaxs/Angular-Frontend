import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DealersApi } from '../../../api/dealers.service';
import { VehiclesApi } from '../../../api/vehicles.service';
import { ToastService } from '../../../core/services/toast.service';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { BadgeComponent } from '../../../shared/ui/badge.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <section class="page-card vehicle-details-page">
      <div class="state-card" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading vehicle details...</p>
      </div>

      <div class="state-card error" *ngIf="!loading && errorMessage">
        <p>{{ errorMessage }}</p>
        <button type="button" (click)="load()">Retry</button>
      </div>

      <article class="details-card" *ngIf="!loading && !errorMessage && vehicle">
        <img [src]="vehicle.imageUrl || placeholderImage" [alt]="vehicle.name" class="vehicle-image" />

        <div class="content">
          <h2>{{ vehicle.name }}</h2>
          <p class="muted">{{ vehicle.brand }}</p>
          <p class="price">INR {{ vehicle.price | number: '1.0-0' }}</p>
          <app-badge [value]="formatVehicleStatus(vehicle.status)"></app-badge>
          <p class="meta">Dealer: {{ dealerName || ('Dealer #' + vehicle.dealerId) }}</p>

          <div class="actions">
            <button type="button" class="btn" (click)="bookVehicle()">Book Now</button>
            <button type="button" class="btn btn-ghost" (click)="addFavorite()">Add Favorite</button>
            <button type="button" class="btn btn-ghost" (click)="addReview()">Write Review</button>
            <a routerLink="/customer/vehicles"><button type="button" class="btn btn-ghost">Back</button></a>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .vehicle-details-page {
      display: grid;
      gap: 0.9rem;
    }

    .details-card {
      background: #fff;
      border: 1px solid var(--mm-border);
      border-radius: 16px;
      box-shadow: var(--mm-shadow-md);
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(260px, 460px) 1fr;
    }

    .vehicle-image {
      width: 100%;
      height: 100%;
      min-height: 280px;
      object-fit: cover;
      background: #edf3ff;
    }

    .content {
      padding: 1rem;
    }

    .muted {
      margin: 0 0 0.55rem;
      color: #5c7290;
    }

    .price {
      margin: 0 0 0.35rem;
      font-size: 1.4rem;
      font-weight: 700;
      color: #103050;
    }

    .meta {
      margin: 0 0 0.8rem;
      color: #58718d;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    @media (max-width: 840px) {
      .details-card {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VehicleDetailsComponent implements OnInit {
  vehicle?: Vehicle;
  dealerName = '';
  loading = false;
  errorMessage = '';
  placeholderImage = 'https://placehold.co/900x540/e5edf7/36597f?text=MotoMint';

  private vehicleId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealersApi: DealersApi,
    private vehiclesApi: VehiclesApi,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    if (!this.vehicleId || Number.isNaN(this.vehicleId)) {
      this.errorMessage = 'Invalid vehicle id.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.vehiclesApi.getById(this.vehicleId).subscribe({
      next: (res) => {
        this.vehicle = res;
        this.resolveDealerName(res.dealerId);
      },
      error: (err: HttpErrorResponse) => {
        const msg = typeof err.error === 'string' ? err.error : err.error?.message;
        this.errorMessage = msg || 'Failed to load vehicle details.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  bookVehicle() {
    if (!this.vehicle?.id) return;
    this.router.navigate(['/customer/bookings/create'], {
      queryParams: {
        dealerId: this.vehicle.dealerId,
        vehicleId: this.vehicle.id,
        amount: this.vehicle.price
      }
    });
  }

  addFavorite() {
    if (!this.vehicle) return;
    this.router.navigate(['/customer/favorites/create'], {
      queryParams: {
        dealerId: this.vehicle.dealerId,
        dealerName: this.dealerName || `Dealer #${this.vehicle.dealerId}`,
        productName: this.vehicle.name
      }
    });
  }

  addReview() {
    if (!this.vehicle) return;
    this.toast.info('Share your experience after booking.');
    this.router.navigate(['/customer/reviews/create'], {
      queryParams: {
        productName: this.vehicle.name
      }
    });
  }

  private resolveDealerName(dealerId: number) {
    this.dealerName = '';
    this.dealersApi.get(dealerId).subscribe({
      next: (dealer) => {
        this.dealerName = dealer.dealerName || '';
      },
      error: () => {
        this.dealerName = '';
      }
    });
  }

  formatVehicleStatus(status?: string): 'AVAILABLE' | 'OUT_OF_STOCK' {
    return this.normalizeStatus(status);
  }

  private normalizeStatus(status?: string): 'AVAILABLE' | 'OUT_OF_STOCK' {
    return (status || '').toUpperCase() === 'AVAILABLE' ? 'AVAILABLE' : 'OUT_OF_STOCK';
  }
}
