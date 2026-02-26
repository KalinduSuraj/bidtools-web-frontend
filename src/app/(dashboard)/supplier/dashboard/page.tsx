'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertCircle, ArrowRight, Activity, Zap, MapPin } from 'lucide-react';
import Link from 'next/link';
import { JobsAPI } from '@/lib/api/jobs.api';
import { ItemsAPI } from '@/lib/api/items.api';
import { RentalsAPI } from '@/lib/api/rentals.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { useAuth } from '@/contexts/AuthContext';

export default function SupplierDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [liveJobs, setLiveJobs] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchSupplierData = async () => {
            if (!user?.user_id) return;

            try {
                // Fetch nearby jobs (using dummy coords for broad search if no location granted)
                const { data: jobs } = await JobsAPI.getNearbyJobs({ latitude: 37.7749, longitude: -122.4194, radiusKm: 50 });

                // Fetch inventory for count
                const { data: items } = await ItemsAPI.getSupplierItems(user.user_id);

                // Fetch rentals (endpoint may be temporarily unavailable)
                let rentals: any[] = [];
                try {
                    const { data: rentalsData } = await RentalsAPI.getSupplierRentals(user.user_id);
                    rentals = Array.isArray(rentalsData) ? rentalsData : [];
                } catch (rentalErr: any) {
                    console.warn('Rental API unavailable:', rentalErr.response?.status, rentalErr.message);
                }

                setLiveJobs(Array.isArray(jobs) ? jobs : []);
                setInventory(Array.isArray(items) ? items : []);
                setOrders(rentals);
            } catch (error) {
                console.error('Failed to fetch supplier metrics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSupplierData();
    }, [user]);

    if (isLoading) {
        return (
            <LoadingWindow
                fullScreen
                message="Loading Dashboard..."
                submessage="Establishing secure connection to BidTools network..."
            />
        );
    }

    const availableInventory = inventory.filter(i => i.status === 'available').length;
    const totalInventory = inventory.length;
    const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h1>
                        <span className="px-2 py-0.5 rounded-full bg-accent-success/10 text-accent-success text-xs font-bold border border-accent-success/20">Verified Partner</span>
                    </div>
                    <p className="text-muted">Monitor your live inventory, active bids, and new job leads.</p>
                </div>

                <Link
                    href="/supplier/inventory"
                    className="px-6 py-3 bg-surface hover:bg-surface-hover text-main rounded-xl font-medium border border-subtle shadow-theme-sm transition-all flex items-center gap-2"
                >
                    <Package className="w-5 h-5" />
                    Manage Inventory
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: TrendingUp, label: 'Monthly Revenue', value: '$0.00', trend: 'Waiting on first order', color: 'text-accent-success', bg: 'bg-accent-success/10' },
                    { icon: Package, label: 'Available Inventory', value: `${availableInventory}/${totalInventory}`, trend: totalInventory > 0 ? `${Math.round(((totalInventory - availableInventory) / totalInventory) * 100)}% utilization rate` : 'No items listed', color: 'text-primary', bg: 'bg-primary/10' },
                    { icon: Activity, label: 'Market Leads (Live)', value: liveJobs.length.toString(), trend: 'Matching criteria found', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { icon: AlertCircle, label: 'Active Rentals', value: activeOrders.toString(), trend: 'Equipment currently deployed', color: 'text-accent-danger', bg: 'bg-accent-danger/10' },
                ].map((kpi, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={kpi.label}
                        className="p-5 rounded-2xl bg-surface border border-subtle relative overflow-hidden group shadow-theme-sm"
                    >
                        {/* Hover Glow Effect */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${kpi.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} w-fit mb-4`}>
                            <kpi.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{kpi.value}</h3>
                        <p className="text-sm text-main font-medium">{kpi.label}</p>
                        <p className="text-xs text-muted mt-1">{kpi.trend}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">

                {/* Job Feed / Opportunities */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" /> Live Job Feed
                        </h2>
                        <button className="text-sm font-medium text-primary hover:underline">View All Leads</button>
                    </div>

                    <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden flex flex-col">
                        <div className="p-4 bg-surface-hover/50 border-b border-subtle flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Demands Near You (API Sourced)</span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-success animate-pulse" /> Network Polling OK</span>
                        </div>

                        <div className="divide-y divide-subtle">
                            {liveJobs.length === 0 ? (
                                <div className="p-8 text-center text-muted">
                                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>No job demands found within a 50km radius.</p>
                                </div>
                            ) : liveJobs.map((job) => (
                                <div key={job.job_id} className="p-4 hover:bg-base/50 transition-colors group flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-mono text-muted">{job.job_id.split('-')[0]}</span>
                                            <span className="text-xs font-semibold text-accent-success bg-accent-success/10 px-2 py-0.5 rounded-full">New Match</span>
                                            <span className="text-xs text-muted">Needed: {new Date(job.required_from).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-bold text-main leading-tight mb-1">{job.job_description}</h4>
                                        <p className="text-sm text-muted">Contractor: {job.contractor_id}</p>
                                    </div>
                                    <button className="w-full sm:w-auto px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-medium transition-colors border border-primary/20 hover:border-transparent whitespace-nowrap">
                                        Submit Quote
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upcoming Orders */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Upcoming Deployment</h2>
                    </div>

                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-surface border border-dashed border-subtle text-center text-muted">
                                <p>You have no active or pending equipment rentals.</p>
                            </div>
                        ) : orders.slice(0, 4).map(order => (
                            <div key={order.rental_id} className="p-5 rounded-2xl bg-surface border border-subtle shadow-theme-sm relative overflow-hidden">
                                {order.status === 'pending' && <div className="absolute top-0 left-0 w-1 h-full bg-accent-warning" />}
                                {order.status === 'active' && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}

                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <span className="text-xs font-mono text-muted">{order.rental_id.split('-')[0]}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${order.status === 'pending' ? 'bg-accent-warning/10 text-accent-warning' : 'bg-primary/10 text-primary'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-main mb-1 pl-2">Job #{order.job_id.split('-')[0]}</h4>
                                <p className="text-sm text-muted pl-2">{new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}</p>

                                <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-medium border border-subtle rounded-lg hover:bg-surface-hover transition-colors">
                                    Track Fulfillment <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
