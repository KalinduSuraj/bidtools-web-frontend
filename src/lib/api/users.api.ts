import { apiClient } from './client';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user.types';

export const UsersAPI = {
    /** GET /users?role=&status=&limit=&offset= - Get all users */
    getUsers: async (params?: { role?: string, status?: string, limit?: number, offset?: number }) =>
        apiClient.get<User[]>('/users', { params }),

    /** GET /users/:userId - Get user by ID */
    getUserById: async (userId: string) =>
        apiClient.get<User>(`/users/${userId}`),

    /** POST /users - Create a user */
    createUser: async (data: CreateUserDto) =>
        apiClient.post<User>('/users', data),

    /** PUT /users/:userId - Update a user */
    updateUser: async (userId: string, data: UpdateUserDto) =>
        apiClient.put<User>(`/users/${userId}`, data),

    /** DELETE /users/:id - Delete a user */
    deleteUser: async (userId: string) =>
        apiClient.delete(`/users/${userId}`),
};
