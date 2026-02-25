export interface Payment {
    payment_id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    payment_method: string;
    rental_id: string;
    created_at: string;
    updated_at?: string;
}
