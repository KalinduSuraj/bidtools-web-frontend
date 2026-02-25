import { apiClient } from './client';
import type { Profile, CreateProfileDto, UpdateVerificationStatusDto } from '@/types/profile.types';

export const ProfilesAPI = {
    /** GET /profiles?profile_type=&verification_status= - Get profiles */
    getProfiles: async (params?: { profile_type?: string, verification_status?: string }) =>
        apiClient.get<Profile[]>('/profiles', { params }),

    /** GET /profiles/:id - Get profile by ID */
    getProfileById: async (profileId: string) =>
        apiClient.get<Profile>(`/profiles/${profileId}`),

    /** GET /profiles/user/:userId - Get profiles by user ID (returns array) */
    getProfileByUserId: async (userId: string) =>
        apiClient.get<Profile[]>(`/profiles/user/${userId}`),

    /** POST /profiles - Create a profile */
    createProfile: async (data: CreateProfileDto) =>
        apiClient.post<Profile>('/profiles', data),

    /** PUT /profiles/:id - Update a profile */
    updateProfile: async (profileId: string, data: Partial<CreateProfileDto>) =>
        apiClient.put<Profile>(`/profiles/${profileId}`, data),

    /** DELETE /profiles/:id - Delete a profile */
    deleteProfile: async (profileId: string) =>
        apiClient.delete(`/profiles/${profileId}`),

    /** PATCH /profiles/:profileId/verification-status - Update verification status */
    updateVerificationStatus: async (profileId: string, status: string) =>
        apiClient.patch<Profile>(`/profiles/${profileId}/verification-status`, { verification_status: status }),

    /** GET /contractors/:id - Get contractor profile */
    getContractorProfile: async (id: string) =>
        apiClient.get(`/contractors/${id}`),

    /** GET /suppliers/:id - Get supplier profile */
    getSupplierProfile: async (id: string) =>
        apiClient.get(`/suppliers/${id}`),

    /** GET /admins/:id - Get admin profile */
    getAdminProfile: async (id: string) =>
        apiClient.get(`/admins/${id}`),

    /** POST /profiles/:userId/business-license/upload-url - Get upload URL */
    getUploadUrl: async (userId: string) =>
        apiClient.post(`/profiles/${userId}/business-license/upload-url`),

    /** GET /profiles/:userId/business-license/download-url - Get download URL */
    getDownloadUrl: async (userId: string) =>
        apiClient.get(`/profiles/${userId}/business-license/download-url`),
};
