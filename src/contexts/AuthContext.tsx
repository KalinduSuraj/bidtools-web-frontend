'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserSummary {
    user_id: string;
    cognito_username?: string;
    name: string;
    email: string;
    role: {
        name: 'contractor' | 'supplier' | 'admin';
    };
    status: any;
    created_at: string;
}

interface AuthContextType {
    user: UserSummary | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, refreshToken: string, userData: UserSummary) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Attempt to parse user from local storage on mount
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data from local storage');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, refreshToken: string, userData: UserSummary) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
        // Force reload to clear states
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
