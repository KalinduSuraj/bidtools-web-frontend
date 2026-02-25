export interface Rental {
    rental_id: string;
    start_date: string;
    end_date: string;
    total_cost: number;
    status: 'active' | 'completed' | 'cancelled';
    job_id: string;
    item_id: string;
    created_at: string;
    updated_at?: string;
}
