export interface Notification {
    notification_id: string;
    message: string;
    read: boolean;
    user_id: string;
    created_at: string;
    updated_at?: string;
}
