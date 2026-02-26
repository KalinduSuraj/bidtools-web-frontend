import { apiClient } from './client';
import type { Rental, CreateRentalDto } from '@/types/rental.types';

export const RentalsAPI = {
    /** GET /rental/contractor?contractorId= - Get contractor rentals */
    getContractorRentals: async (contractorId: string) =>
        apiClient.get<Rental[]>('/rental/contractor', { params: { contractorId } }),

    /** GET /rental/supplier?supplierId= - Get supplier rentals */
    getSupplierRentals: async (supplierId: string) =>
        apiClient.get<Rental[]>('/rental/supplier', { params: { supplierId } }),

    /** GET /rental/:rentalId - Get rental by ID */
    getRentalById: async (rentalId: string) =>
        apiClient.get<Rental>(`/rental/${rentalId}`),

    /** POST /rental - Create a rental */
    createRental: async (data: CreateRentalDto) =>
        apiClient.post<Rental>('/rental', data),
};
