import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Payment, PaymentCreateRequest } from '../shared/models/payment.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentsApi {
  private base = `${environment.apiBaseUrl}/payments`;
  constructor(private http: HttpClient) {}

  pay(p: PaymentCreateRequest): Observable<Payment> { return this.http.post<Payment>(`${this.base}`, p); }
}
