export interface Notification {
    PK: string;
    SK: string;
    user_id: string;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CreateNotificationDto {
    user_id: string;
    type: string;
    message: string;
}
