export interface Profile {
    profile_id: string;
    company_name: string;
    contact_number: string;
    address: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    documents_url?: string;
    user_id: string;
    created_at: string;
    updated_at?: string;
}
