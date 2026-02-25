export interface Rental {
    rental_id: string;
    contractor_id: string;
    supplier_id: string;
    bid_id: string;
    item_id: string;
    job_id: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    status: 'active' | 'completed' | 'cancelled';
    payment_status: string;
    created_at: string;
    updated_at?: string;
}

export interface CreateRentalDto {
    bid_id: string;
    item_id: string;
    start_date: string;
    end_date: string;
    total_amount: number;
}
