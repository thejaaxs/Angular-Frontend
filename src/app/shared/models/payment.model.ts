export interface Payment {
  id?: number;
  bookingId: number;
  customerId: number;
  amount: number;
  paymentMethod: 'CARD' | 'UPI' | string;
  paymentStatus?: 'SUCCESS' | 'FAILED' | string;
  transactionId?: string;
  paymentDate?: string;
}

export interface PaymentCreateRequest {
  bookingId: number;
  customerId: number;
  amount: number;
  paymentMethod: 'CARD' | 'UPI';
}
