import { apiClient } from './client';
import type { Item, CreateItemDto, ChangeItemStatusDto } from '@/types/item.types';

export const ItemsAPI = {
    /** GET /items?status= - Get all items */
    getAllItems: async (params?: { status?: string }) =>
        apiClient.get<Item[]>('/items', { params }),

    /** GET /items/supplier/:supplierId - Get items by supplier */
    getSupplierItems: async (supplierId: string) =>
        apiClient.get<Item[]>(`/items/supplier/${supplierId}`),

    /** GET /items/:itemId - Get item by ID (GSI1 lookup) */
    getItemById: async (itemId: string) =>
        apiClient.get<Item>(`/items/${itemId}`),

    /** GET /items/supplier/:supplierId/:itemId - Get item by supplier and ID */
    getItemBySupplierAndId: async (supplierId: string, itemId: string) =>
        apiClient.get<Item>(`/items/supplier/${supplierId}/${itemId}`),

    /** POST /items - Create a new item */
    createItem: async (data: CreateItemDto) =>
        apiClient.post<Item>('/items', data),

    /** PUT /items/supplier/:supplierId/:itemId - Update an item */
    updateItem: async (supplierId: string, itemId: string, data: Partial<CreateItemDto>) =>
        apiClient.put<Item>(`/items/supplier/${supplierId}/${itemId}`, data),

    /** DELETE /items/supplier/:supplierId/:itemId - Delete an item */
    deleteItem: async (supplierId: string, itemId: string) =>
        apiClient.delete(`/items/supplier/${supplierId}/${itemId}`),

    /** PATCH /items/supplier/:supplierId/:itemId/status - Change item status */
    changeStatus: async (supplierId: string, itemId: string, data: ChangeItemStatusDto) =>
        apiClient.patch(`/items/supplier/${supplierId}/${itemId}/status`, data),
};
