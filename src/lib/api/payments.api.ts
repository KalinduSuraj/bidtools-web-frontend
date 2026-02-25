import { apiClient } from './client';
import type { Payment, CreatePaymentDto } from '@/types/payment.types';

export const PaymentsAPI = {
    /** GET /payments - Get all payments */
    getPayments: async () =>
        apiClient.get<Payment[]>('/payments'),

    /** GET /payments/:id - Get payment by ID */
    getPaymentById: async (id: string) =>
        apiClient.get<Payment>(`/payments/${id}`),

    /** POST /payments - Create a payment */
    processPayment: async (data: CreatePaymentDto) =>
        apiClient.post<Payment>('/payments', data),

    /** PUT /payments/:id - Update a payment */
    updatePayment: async (id: string, data: Partial<CreatePaymentDto>) =>
        apiClient.put<Payment>(`/payments/${id}`, data),

    /** DELETE /payments/:id - Delete a payment */
    deletePayment: async (id: string) =>
        apiClient.delete(`/payments/${id}`),
};
