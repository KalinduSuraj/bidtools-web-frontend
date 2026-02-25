export interface Bid {
    bid_id: string;
    amount: number;
    status: 'pending' | 'accepted' | 'rejected';
    supplier_id: string;
    job_id: string;
    created_at: string;
    updated_at?: string;
    supplier?: any;
}
