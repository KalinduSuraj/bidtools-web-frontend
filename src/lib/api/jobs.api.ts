import { apiClient } from './client';
import type { Job, CreateJobDto } from '@/types/job.types';

export const JobsAPI = {
    /** GET /jobs/nearby?latitude=&longitude=&radiusKm= - Get nearby jobs */
    getNearbyJobs: async (params: { latitude: string | number, longitude: string | number, radiusKm?: string | number }) =>
        apiClient.get<Job[]>('/jobs/nearby', {
            params: {
                latitude: String(params.latitude),
                longitude: String(params.longitude),
                radiusKm: params.radiusKm ? String(params.radiusKm) : undefined,
            }
        }),

    /** GET /jobs/contractor - Get jobs for current contractor (uses JWT) */
    getContractorJobs: async () =>
        apiClient.get<Job[]>('/jobs/contractor'),

    /** GET /jobs/:jobId - Get job by ID */
    getJobById: async (jobId: string) =>
        apiClient.get<Job>(`/jobs/${jobId}`),

    /** POST /jobs - Create a new job (uses JWT for contractor_id) */
    createJob: async (data: CreateJobDto) =>
        apiClient.post<Job>('/jobs', data),
};
