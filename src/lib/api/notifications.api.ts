import { apiClient } from './client';
import type { Notification } from '@/types/notification.types';

export const NotificationsAPI = {
    getNotifications: async () =>
        apiClient.get<Notification[]>('/notifications'),

    markAsRead: async (notificationId: string) =>
        apiClient.patch(`/notifications/${notificationId}/read`),

    markAllAsRead: async () =>
        apiClient.patch('/notifications/read-all')
};
