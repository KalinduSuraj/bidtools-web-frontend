export interface Bid {
    bid_id: string;
    job_id: string;
    supplier_id: string;
    amount: number;
    bid_value?: number;
    status: 'pending' | 'accepted' | 'rejected';
    items?: BidItem[];
    created_at: string;
    updated_at?: string;
    supplier?: any;
}

export interface BidItem {
    itemId?: string;
    item_id?: string;
    quantity: number;
}

export interface PlaceBidDto {
    jobId: string;
    amount: number;
    items?: BidItem[];
}

export interface CreateBidDto {
    job_id: string;
    bid_value: number;
    items: BidItem[];
}

export interface CreateAuctionDto {
    jobId: string;
}
