import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Booking, BookingCreateRequest } from '../shared/models/booking.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingsApi {
  private base = `${environment.apiBaseUrl}/bookings`;
  constructor(private http: HttpClient) {}

  create(b: BookingCreateRequest): Observable<Booking> { return this.http.post<Booking>(`${this.base}`, b); }
  getById(id: number): Observable<Booking> { return this.http.get<Booking>(`${this.base}/${id}`); }
  byCustomer(customerId: number): Observable<Booking[]> { return this.http.get<Booking[]>(`${this.base}/customer/${customerId}`); }
  byDealer(dealerId: number): Observable<Booking[]> { return this.http.get<Booking[]>(`${this.base}/dealer/${dealerId}`); }
  cancel(id: number): Observable<string> { return this.http.put(`${this.base}/cancel/${id}`, {}, { responseType: 'text' }); }
  confirm(id: number): Observable<string> { return this.http.put(`${this.base}/confirm/${id}`, {}, { responseType: 'text' }); }
}
