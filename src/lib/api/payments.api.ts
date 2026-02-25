import { apiClient } from './client';
import type { Payment } from '@/types/payment.types';

export const PaymentsAPI = {
    getPayments: async () =>
        apiClient.get<Payment[]>('/payments'),

    processPayment: async (data: Partial<Payment>) =>
        apiClient.post<Payment>('/payments', data)
};
