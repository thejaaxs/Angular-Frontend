import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsApi } from '../../../api/bookings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { BookingCreateRequest } from '../../../shared/models/booking.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomersApi } from '../../../api/customers.service';
import { Customer } from '../../../shared/models/customer.model';
import { AuthService } from '../../../core/services/auth.service';
import { DealersApi } from '../../../api/dealers.service';
import { Dealer } from '../../../shared/models/dealer.model';
import { VehiclesApi } from '../../../api/vehicles.service';
import { Vehicle } from '../../../shared/models/vehicle.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-create.component.html',
  styleUrl: './booking-create.component.css'
})
export class BookingCreateComponent {
  model: BookingCreateRequest = { customerId: 0, dealerId: 0, vehicleId: 0, amount: 1000 };
  loading = false;
  customers: Customer[] = [];
  dealers: Dealer[] = [];
  vehicles: Vehicle[] = [];
  private requestedVehicleId = 0;

  constructor(
    private api: BookingsApi,
    private customersApi: CustomersApi,
    private dealersApi: DealersApi,
    private vehiclesApi: VehiclesApi,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    const query = this.route.snapshot.queryParamMap;
    const dealerId = Number(query.get('dealerId'));
    const vehicleId = Number(query.get('vehicleId'));
    const amount = Number(query.get('amount'));

    if (dealerId > 0) this.model.dealerId = dealerId;
    if (vehicleId > 0) {
      this.model.vehicleId = vehicleId;
      this.requestedVehicleId = vehicleId;
    }
    if (amount > 0) this.model.amount = amount;

    this.loadCustomers();
    this.loadDealers();
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
      error: () => {
        this.toast.error('Failed to load customers. Enter Customer ID manually.');
      }
    });
  }

  private loadDealers() {
    this.dealersApi.list().subscribe({
      next: (res) => {
        this.dealers = res;
        const email = this.auth.getEmail();
        const matched = email ? this.dealers.find((d) => d.email?.toLowerCase() === email.toLowerCase()) : undefined;
        if (this.model.dealerId > 0) {
          const byId = this.dealers.find((d) => d.dealerId === this.model.dealerId);
          if (!byId?.dealerId) {
            this.model.dealerId = 0;
          }
        }

        if (this.model.dealerId > 0) {
          this.loadVehiclesByDealer();
          return;
        }

        if (matched?.dealerId) {
          this.model.dealerId = matched.dealerId;
        } else if (this.dealers[0]?.dealerId) {
          this.model.dealerId = this.dealers[0].dealerId;
        }
        this.loadVehiclesByDealer();
      },
      error: () => {
        this.toast.error('Failed to load dealers. Enter Dealer ID manually.');
      }
    });
  }

  onDealerChange() {
    this.loadVehiclesByDealer();
  }

  private loadVehiclesByDealer() {
    if (!this.model.dealerId) return;
    this.vehiclesApi.listByDealer(this.model.dealerId).subscribe({
      next: (res) => {
        this.vehicles = res;
        if (this.requestedVehicleId > 0) {
          const requested = this.vehicles.find((v) => v.id === this.requestedVehicleId);
          if (requested?.id) {
            this.selectVehicle(requested.id);
            return;
          }
        }
        if (this.model.vehicleId > 0) {
          const current = this.vehicles.find((v) => v.id === this.model.vehicleId);
          if (current?.id) {
            this.selectVehicle(current.id);
            return;
          }
        }
        if (this.vehicles[0]?.id) {
          this.selectVehicle(this.vehicles[0].id);
        } else {
          this.model.vehicleId = 0;
        }
      },
      error: () => {
        this.vehicles = [];
        this.toast.error('Failed to load vehicles for selected dealer.');
      }
    });
  }

  selectVehicle(vehicleId: number) {
    const selected = this.vehicles.find((v) => v.id === Number(vehicleId));
    if (!selected?.id) return;
    this.model.vehicleId = selected.id;
    if (selected.price) this.model.amount = selected.price;
  }

  submit() {
    this.loading = true;
    this.api.create(this.model).subscribe({
      next: () => {
        this.toast.success('Booking created');
        this.router.navigateByUrl('/customer/bookings');
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message || 'Booking creation failed. Please verify customer, dealer and vehicle IDs.';
        this.toast.error(msg);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

