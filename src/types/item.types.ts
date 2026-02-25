export interface Item {
    item_id: string;
    supplier_id: string;
    name: string;
    description?: string;
    price_per_day: number;
    price_per_hour: number;
    status: 'available' | 'rented' | 'maintenance';
    latitude: number;
    longitude: number;
    is_deleted?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CreateItemDto {
    name: string;
    description?: string;
    price_per_day: number;
    price_per_hour: number;
    latitude: number;
    longitude: number;
}

export interface ChangeItemStatusDto {
    status: string;
}
