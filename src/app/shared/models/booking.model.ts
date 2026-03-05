export interface Booking {
  id?: number;
  customerId: number;
  dealerId: number;
  vehicleId: number;
  bookingDate?: string;
  deliveryDate?: string;
  bookingStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | string;
  paymentStatus?: 'UNPAID' | 'PAID' | string;
  amount?: number;
  createdAt?: string;
}

export interface BookingCreateRequest {
  customerId: number;
  dealerId: number;
  vehicleId: number;
  amount?: number;
  deliveryDate?: string;
}
