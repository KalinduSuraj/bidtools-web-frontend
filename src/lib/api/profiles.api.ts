import { apiClient } from './client';
import type { Profile } from '@/types/profile.types';

export const ProfilesAPI = {
    getProfiles: async (params?: { profile_type?: string, verification_status?: string }) =>
        apiClient.get<Profile[]>('/profiles', { params }),

    getProfileByUserId: async (userId: string) =>
        apiClient.get<Profile>(`/profiles/user/${userId}`),

    updateVerificationStatus: async (profileId: string, status: string) =>
        apiClient.patch<Profile>(`/profiles/${profileId}/verification-status`, { verification_status: status })
};
