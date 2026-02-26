'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Calendar, DollarSign, CheckCircle2, Clock, XCircle, Package } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RentalsAPI } from '@/lib/api/rentals.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SupplierOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.user_id) return;
            setIsLoading(true);
            try {
                let rawOrders: any[] = [];
                try {
                    const { data } = await RentalsAPI.getSupplierRentals(user.user_id);
                    rawOrders = Array.isArray(data) ? data : [];
                } catch (apiErr: any) {
                    console.warn('Rental API unavailable:', apiErr.response?.status, apiErr.message);
                }
                const sorted = rawOrders.sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setOrders(sorted);
            } catch (err: any) {
                console.error('Failed to load orders:', err);
                setError(err.response?.data?.message || 'Failed to load orders.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [user?.user_id]);

    const filtered = orders
        .filter(o => statusFilter === 'all' || o.status === statusFilter)
        .filter(o =>
            o.rental_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.job_id?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    if (isLoading) return <LoadingWindow fullScreen message="Loading orders..." />;

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="border-b border-subtle pb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-primary" /> Orders & Agreements
                </h1>
                <p className="text-muted">Track all your rental agreements and order fulfillments.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm">
                    <p className="text-sm font-bold text-muted uppercase tracking-wider">Total Orders</p>
                    <p className="text-3xl font-black text-main mt-2">{orders.length}</p>
                </div>
                <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm">
                    <p className="text-sm font-bold text-muted uppercase tracking-wider">Active</p>
                    <p className="text-3xl font-black text-accent-success mt-2">{orders.filter(o => o.status === 'active').length}</p>
                </div>
                <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm">
                    <p className="text-sm font-bold text-muted uppercase tracking-wider">Revenue Earned</p>
                    <p className="text-3xl font-black text-primary mt-2">${totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by rental or job ID..."
                        className="w-full bg-surface border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:border-primary transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'active', 'completed', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors border ${statusFilter === s
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface text-muted border-subtle hover:text-main'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {error && <ErrorWindow message={error} />}

            {filtered.length === 0 ? (
                <EmptyState
                    title="No Orders Found"
                    message="Your rental agreements and orders will appear here once contractors accept your bids."
                    icon={<Package className="w-12 h-12 opacity-50" />}
                />
            ) : (
                <div className="space-y-3">
                    {filtered.map((order, i) => {
                        const statusColor = order.status === 'active'
                            ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                            : order.status === 'completed'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-accent-danger/10 text-accent-danger border-accent-danger/20';

                        const StatusIcon = order.status === 'active' ? CheckCircle2
                            : order.status === 'completed' ? CheckCircle2 : XCircle;

                        return (
                            <motion.div
                                key={order.rental_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm hover:shadow-theme-md transition-all"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="font-bold text-main">Agreement #{order.rental_id?.split('-')[0]}</p>
                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${statusColor}`}>
                                                <StatusIcon className="w-3 h-3" /> {order.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(order.start_date).toLocaleDateString()} — {new Date(order.end_date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                <span className="font-bold text-main">${Number(order.total_amount).toFixed(2)}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/supplier/rentals/${order.rental_id}`}
                                        className="text-sm font-bold text-primary hover:underline"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
