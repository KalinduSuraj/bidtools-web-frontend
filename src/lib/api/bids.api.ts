import { apiClient } from './client';
import type { Bid, PlaceBidDto, CreateBidDto, CreateAuctionDto } from '@/types/bid.types';

export const BidsAPI = {
    /** GET /bid/:jobId - Get all bids for a job */
    getBidsForJob: async (jobId: string) =>
        apiClient.get<Bid[]>(`/bid/${jobId}`),

    /** GET /bid/:jobId/:bidId - Get a specific bid */
    getBidDetails: async (jobId: string, bidId: string) =>
        apiClient.get<Bid>(`/bid/${jobId}/${bidId}`),

    /** POST /bid/place - Place a bid (new) */
    placeBid: async (data: PlaceBidDto) =>
        apiClient.post<Bid>('/bid/place', data),

    /** POST /bid - Create a bid (legacy) */
    createBid: async (data: CreateBidDto) =>
        apiClient.post<Bid>('/bid', data),

    /** POST /bid/auction - Create an auction */
    createAuction: async (data: CreateAuctionDto) =>
        apiClient.post('/bid/auction', data),

    /** PATCH /bid/:jobId/:bidId - Update bid status (accept/reject) */
    updateBidStatus: async (jobId: string, bidId: string, status: 'accepted' | 'rejected') =>
        apiClient.patch<Bid>(`/bid/${jobId}/${bidId}`, { status }),
};
