export interface Job {
    job_id: string;
    contractor_id: string;
    job_description: string;
    latitude: number;
    longitude: number;
    required_from: string;
    required_to: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    bids?: any[];
    created_at: string;
    updated_at?: string;
}

export interface CreateJobDto {
    job_description: string;
    latitude: number;
    longitude: number;
    required_from: string;
    required_to: string;
}
