export interface User {
    user_id: string;
    email: string;
    name: string;
    role: {
        role_id: string;
        name: string;
    };
    status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
    created_at: string;
    updated_at?: string;
}
