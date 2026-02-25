import { apiClient } from './client';
import type { Rental } from '@/types/rental.types';

export const RentalsAPI = {
    getContractorRentals: async (contractorId: string) =>
        apiClient.get<Rental[]>('/rental/contractor', { params: { contractor_id: contractorId } }),

    getSupplierRentals: async (supplierId: string) =>
        apiClient.get<Rental[]>('/rental/supplier', { params: { supplier_id: supplierId } }),

    getRentalById: async (rentalId: string) =>
        apiClient.get<Rental>(`/rental/${rentalId}`)
};
