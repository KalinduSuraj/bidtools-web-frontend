'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsAPI } from '@/lib/api/notifications.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SupplierNotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        if (!user?.user_id) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await NotificationsAPI.getNotifications(user.user_id);
            const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setNotifications(sorted);
        } catch (err: any) {
            console.error('Failed to load notifications:', err);
            setError(err.response?.data?.message || 'Failed to load notifications.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?.user_id]);

    const handleMarkAsRead = async (notification: any) => {
        if (!user?.user_id) return;
        try {
            await NotificationsAPI.markAsRead(user.user_id, notification.SK);
            setNotifications(prev => prev.map(n => n.SK === notification.SK ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (isLoading) return <LoadingWindow fullScreen message="Loading notifications..." />;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-primary" /> Notifications
                    </h1>
                    <p className="text-muted">
                        Stay updated on bid results, rental agreements, and order activity.
                        {unreadCount > 0 && <span className="ml-2 text-primary font-bold">({unreadCount} unread)</span>}
                    </p>
                </div>
            </div>

            {error && <ErrorWindow message={error} />}

            {notifications.length === 0 ? (
                <EmptyState
                    title="No Notifications"
                    message="You're all caught up! Notifications about bids and orders will appear here."
                    icon={<Bell className="w-12 h-12 opacity-50" />}
                />
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {notifications.map((n) => (
                            <motion.div
                                key={n.SK || n.PK}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className={`p-4 rounded-2xl border transition-colors ${n.is_read
                                    ? 'bg-surface border-subtle'
                                    : 'bg-primary/5 border-primary/20'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-primary'}`} />
                                        <div className="flex-1">
                                            <p className={`text-sm ${n.is_read ? 'text-muted' : 'text-main font-medium'}`}>{n.message}</p>
                                            <p className="text-xs text-muted mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {!n.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(n)}
                                            className="text-xs text-primary hover:underline font-bold flex items-center gap-1 flex-shrink-0"
                                        >
                                            <Check className="w-3.5 h-3.5" /> Read
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
