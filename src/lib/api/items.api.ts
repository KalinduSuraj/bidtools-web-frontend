import { apiClient } from './client';
import type { Item } from '@/types/item.types';

export const ItemsAPI = {
    getSupplierItems: async (supplierId: string) =>
        apiClient.get<Item[]>(`/items/supplier/${supplierId}`),

    getItemById: async (itemId: string) =>
        apiClient.get<Item>(`/items/${itemId}`),

    createItem: async (data: Partial<Item>) =>
        apiClient.post<Item>('/items', data),

    updateItem: async (itemId: string, data: Partial<Item>) =>
        apiClient.put<Item>(`/items/${itemId}`, data),

    deleteItem: async (itemId: string) =>
        apiClient.delete(`/items/${itemId}`)
};
