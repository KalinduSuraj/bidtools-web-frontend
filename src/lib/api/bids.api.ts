import { apiClient } from './client';
import type { Bid } from '@/types/bid.types';

export const BidsAPI = {
    getBidsForJob: async (jobId: string) =>
        apiClient.get<Bid[]>(`/jobs/${jobId}/bids`),

    getBidsBySupplier: async (supplierId: string) =>
        apiClient.get<Bid[]>(`/bids/supplier/${supplierId}`),

    placeBid: async (data: Partial<Bid>) =>
        apiClient.post<Bid>('/bids', data),

    acceptBid: async (bidId: string) =>
        apiClient.patch<Bid>(`/bids/${bidId}/accept`),

    rejectBid: async (bidId: string) =>
        apiClient.patch<Bid>(`/bids/${bidId}/reject`)
};
