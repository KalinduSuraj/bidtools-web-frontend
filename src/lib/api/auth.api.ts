import { apiClient } from './client';

export const AuthAPI = {
    /** POST /auth/login */
    login: async (data: { email: string; password: string }) =>
        apiClient.post('/auth/login', data),

    /** POST /auth/register */
    register: async (data: { email: string; password: string; name: string; role: string }) =>
        apiClient.post('/auth/register', data),

    /** POST /auth/verify */
    verifyOTP: async (data: { email: string; code: string }) =>
        apiClient.post('/auth/verify', data),

    /** POST /auth/verify/resend */
    resendVerificationCode: async (data: { email: string }) =>
        apiClient.post('/auth/verify/resend', data),

    /** POST /auth/token/refresh */
    refreshToken: async (data: { refresh_token: string }) =>
        apiClient.post('/auth/token/refresh', data),

    /** POST /auth/logout */
    logout: async () =>
        apiClient.post('/auth/logout'),

    /** POST /auth/password/reset/request */
    forgotPassword: async (data: { email: string }) =>
        apiClient.post('/auth/password/reset/request', data),

    /** POST /auth/password/reset/confirm */
    confirmPassword: async (data: { email: string; code: string; new_password: string }) =>
        apiClient.post('/auth/password/reset/confirm', data),

    /** POST /auth/admin/confirm */
    adminConfirmUser: async (data: { email: string }) =>
        apiClient.post('/auth/admin/confirm', data),
};
