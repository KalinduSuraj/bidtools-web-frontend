import { apiClient } from './client';
import type { Rental, CreateRentalDto } from '@/types/rental.types';

export const RentalsAPI = {
    /** GET /rentals?contractorId= - Get contractor rentals */
    getContractorRentals: async (contractorId: string) =>
        apiClient.get<Rental[]>('/rental/contractor/', { params: { contractorId } }),

    /** GET /rentals?supplierId= - Get supplier rentals */
    getSupplierRentals: async (supplierId: string) =>
        apiClient.get<Rental[]>('/rental/supplier/', { params: { supplierId } }),

    /** GET /rentals/:rentalId - Get rental by ID */
    getRentalById: async (rentalId: string) =>
        apiClient.get<Rental>(`/rental/${rentalId}`),

    /** POST /rentals - Create a rental */
    createRental: async (data: CreateRentalDto) =>
        apiClient.post<Rental>('/rental', data),
};
