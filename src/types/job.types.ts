export interface Job {
    job_id: string;
    description: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    required_from: string;
    required_to: string;
    latitude: number;
    longitude: number;
    contractor_id: string;
    bids?: any[];
    created_at: string;
    updated_at?: string;
}
