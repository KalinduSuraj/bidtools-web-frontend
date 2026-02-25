export interface Profile {
    profile_id: string;
    user_id: string;
    profile_type: 'contractor' | 'supplier' | 'admin';
    company_name: string;
    contact_number: string;
    address: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    documents_url?: string;
    created_at: string;
    updated_at?: string;
}

export interface CreateProfileDto {
    user_id: string;
    profile_type: string;
    company_name: string;
    contact_number: string;
    address: string;
}

export interface UpdateVerificationStatusDto {
    verification_status: string;
}
