export interface User {
    user_id: string;
    cognito_username?: string;
    email: string;
    name: string;
    role: {
        name: 'admin' | 'contractor' | 'supplier';
    };
    status: {
        name: string;
    } | string;
    created_at: string;
    updated_at?: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'contractor' | 'supplier';
}

export interface UpdateUserDto {
    email?: string;
    name?: string;
    role?: string;
    status?: string;
}
