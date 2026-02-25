export interface Item {
    item_id: string;
    category: string;
    brand: string;
    model: string;
    condition: string;
    daily_rate: number;
    availability_status: 'available' | 'rented' | 'maintenance';
    supplier_id: string;
    created_at: string;
    updated_at?: string;
}
