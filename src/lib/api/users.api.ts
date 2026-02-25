import { apiClient } from './client';
import type { User } from '@/types/user.types';

export const UsersAPI = {
    getUsers: async (params?: { role?: string, status?: string, limit?: number, offset?: number }) =>
        apiClient.get<User[]>('/users', { params }),

    getUserById: async (userId: string) =>
        apiClient.get<User>(`/users/${userId}`),

    updateUserStatus: async (userId: string, status: string) =>
        apiClient.put<User>(`/users/${userId}`, { status })
};
