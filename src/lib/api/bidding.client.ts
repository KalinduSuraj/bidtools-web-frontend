import axios from 'axios';
import { BIDDING_API_URL } from '@/lib/constants';

/**
 * Separate axios client for the BidTools Bidding Service (Firebase RTDB-backed).
 * Base URL: http://35.174.10.133:3000/api/v1
 */
export const biddingClient = axios.create({
    baseURL: BIDDING_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach auth token if available (for x-api-key secured endpoints)
biddingClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && config.headers) {
        config.headers['x-api-key'] = token;
    }
    return config;
}, (error) => Promise.reject(error));
