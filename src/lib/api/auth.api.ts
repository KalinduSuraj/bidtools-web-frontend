import { apiClient } from './client';

export const AuthAPI = {
    login: async (data: any) => apiClient.post('/auth/login', data),
    register: async (data: any) => apiClient.post('/auth/register', data),
    verifyOTP: async (data: any) => apiClient.post('/auth/verify', data),
    refreshToken: async (data: any) => apiClient.post('/auth/token/refresh', data),
    logout: async () => apiClient.post('/auth/logout')
};
