export interface Payment {
    payment_id: string;
    rental_id: number;
    amount: number;
    payment_method: string;
    transaction_reference: string;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    is_deleted?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CreatePaymentDto {
    rental_id: number;
    amount: number;
    payment_method: string;
    transaction_reference: string;
    currency: string;
}
