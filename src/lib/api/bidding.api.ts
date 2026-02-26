import { biddingClient } from './bidding.client';
import { BIDDING_API_URL } from '@/lib/constants';

// ── Types matching the Bidding Service Swagger ──────────────────────────────

export interface CreateJobAuctionDto {
    jobId: string;
    jobDetails: Record<string, any>;
    startTime: number;   // UNIX ms
    endTime: number;     // UNIX ms
    startingPrice: number;
}

export interface PlaceLiveBidDto {
    supplierId: string;
    itemId: string;
    amount: number;
}

// ── API Functions ───────────────────────────────────────────────────────────

export const BiddingAPI = {
    /**
     * POST /jobs — Create a new job auction in the bidding service.
     * Called when a contractor creates a job so real-time bidding is enabled.
     */
    createJobAuction: async (data: CreateJobAuctionDto) =>
        biddingClient.post('/jobs', data),

    /**
     * POST /jobs/:jobId/bid — Place a bid on a specific job auction.
     * Used by suppliers to submit a live bid.
     */
    placeBid: async (jobId: string, data: PlaceLiveBidDto) =>
        biddingClient.post(`/jobs/${jobId}/bid`, data),

    /**
     * Returns the SSE stream URL for a given job auction.
     * Use with `new EventSource(url)` to receive real-time bid updates.
     * GET /jobs/:jobId/stream
     */
    getStreamUrl: (jobId: string): string =>
        `${BIDDING_API_URL}/jobs/${jobId}/stream`,
};
