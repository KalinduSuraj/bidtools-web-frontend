import { apiClient } from './client';
import type { Notification, CreateNotificationDto } from '@/types/notification.types';

export const NotificationsAPI = {
    /** GET /notification/:userId - Get notifications for a user */
    getNotifications: async (userId: string) =>
        apiClient.get<Notification[]>(`/notification/${userId}`),

    /** GET /notification/:userId/unread-count - Get unread notification count */
    getUnreadCount: async (userId: string) =>
        apiClient.get<{ count: number }>(`/notification/${userId}/unread-count`),

    /** PATCH /notification/:userId/:sk/read - Mark a notification as read */
    markAsRead: async (userId: string, sk: string) =>
        apiClient.patch(`/notification/${userId}/${encodeURIComponent(sk)}/read`),

    /** POST /notification - Create a notification */
    create: async (data: CreateNotificationDto) =>
        apiClient.post<Notification>('/notification', data),
};
