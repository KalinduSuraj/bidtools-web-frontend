export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'BidTools';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const BIDDING_API_URL = process.env.NEXT_PUBLIC_BIDDING_API_URL || 'http://35.174.10.133:3000/api/v1';
export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_FILE_SIZE_MB = 5;

export const ROLES = {
    ADMIN: 'admin',
    CONTRACTOR: 'contractor',
    SUPPLIER: 'supplier'
} as const;
