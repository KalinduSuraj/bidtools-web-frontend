import { apiClient } from './client';
import type { Job } from '@/types/job.types';

export const JobsAPI = {
    getNearbyJobs: async (params: { lat: number, lon: number, radius?: number }) =>
        apiClient.get<Job[]>('/jobs/nearby', { params }),

    getContractorJobs: async (contractorId: string) =>
        apiClient.get<Job[]>('/jobs/contractor', { params: { contractor_id: contractorId } }),

    getJobById: async (jobId: string) =>
        apiClient.get<Job>(`/jobs/${jobId}`),

    createJob: async (data: Partial<Job>) =>
        apiClient.post<Job>('/jobs', data),

    updateJobStatus: async (jobId: string, status: string) =>
        apiClient.patch<Job>(`/jobs/${jobId}/status`, { status })
};
