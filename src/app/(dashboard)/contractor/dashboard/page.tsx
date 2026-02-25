'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Clock, CheckCircle2, Map as MapIcon, List, ArrowRight, MapPin, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { JobsAPI } from '@/lib/api/jobs.api';
import { RentalsAPI } from '@/lib/api/rentals.api';
import { API_URL } from '@/lib/constants';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { MapView } from '@/components/map/MapView';
import { useAuth } from '@/contexts/AuthContext';

export default function ContractorDashboard() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [liveBids, setLiveBids] = useState<any[]>([]);
    const [stats, setStats] = useState({
        activeRequests: 0,
        awardedJobs: 0,
        totalSpent: 0
    });
    const [jobs, setJobs] = useState<any[]>([]);

    const eventSourceRef = useRef<EventSource | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchContractorData = async () => {
            if (!user?.user_id) return;

            try {
                // Fetch jobs and rentals independently so one failure doesn't block the other
                const [jobsResult, rentalsResult] = await Promise.allSettled([
                    JobsAPI.getContractorJobs(),
                    RentalsAPI.getContractorRentals(user.user_id),
                ]);

                const validJobs = jobsResult.status === 'fulfilled' && Array.isArray(jobsResult.value.data)
                    ? jobsResult.value.data : [];
                const validRentals = rentalsResult.status === 'fulfilled' && Array.isArray(rentalsResult.value.data)
                    ? rentalsResult.value.data : [];

                const activeRequests = validJobs.filter(j => j.status === 'open').length;
                const awardedJobs = validRentals.length;
                const totalSpent = validRentals.reduce((acc, r) => acc + (r.total_amount || 0), 0);

                setJobs(validJobs);
                setStats({ activeRequests, awardedJobs, totalSpent });
            } catch (error) {
                console.error('Failed to fetch contractor data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContractorData();
    }, [user]);

    // Connect to SSE stream when a job is selected
    useEffect(() => {
        if (!selectedJobId) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            return;
        }

        // Clear previous bids for the new selected stream
        setLiveBids([]);

        // Connect to stream
        const sse = new EventSource(`${API_URL}/bid/stream/${selectedJobId}`);
        eventSourceRef.current = sse;

        sse.onmessage = (event) => {
            try {
                const newBid = JSON.parse(event.data);
                // Prepend to show newest at top
                setLiveBids(prev => [{ ...newBid, receivedAt: new Date().toLocaleTimeString() }, ...prev]);
            } catch (err) {
                console.error("Error parsing SSE data:", err);
            }
        };

        sse.onerror = (err) => {
            console.error("SSE connection error:", err);
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [selectedJobId]);

    if (isLoading) {
        return (
            <LoadingWindow
                fullScreen
                message="Loading Dashboard..."
                submessage="Loading your project dashboard..."
            />
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Contractor Dashboard</h1>
                    <p className="text-muted">Manage your equipment requests and review live bids.</p>
                </div>

                <Link
                    href="/contractor/requests/new"
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-theme-lg transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    New Request
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Briefcase, label: 'Active Requests', value: stats.activeRequests.toString(), trend: 'Currently open to bids', color: 'text-primary', bg: 'bg-primary/10' },
                    { icon: Activity, label: 'Stream Status', value: eventSourceRef.current ? 'Live' : 'Idle', trend: selectedJobId ? 'Monitoring selected' : 'No job selected', color: eventSourceRef.current ? 'text-accent-success' : 'text-orange-500', bg: eventSourceRef.current ? 'bg-accent-success/10' : 'bg-orange-500/10' },
                    { icon: CheckCircle2, label: 'Awarded Jobs', value: stats.awardedJobs.toString(), trend: 'Lifetime total', color: 'text-accent-success', bg: 'bg-accent-success/10' },
                    { icon: Briefcase, label: 'Total Spent', value: `$${(stats.totalSpent / 1000).toFixed(1)}k`, trend: 'Lifetime volume', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((kpi, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={kpi.label}
                        className="p-5 rounded-2xl bg-surface border border-subtle shadow-theme-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.label === 'Stream Status' && eventSourceRef.current ? 'animate-pulse' : ''}`} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{kpi.value}</h3>
                        <p className="text-sm text-main font-medium">{kpi.label}</p>
                        <p className="text-xs text-muted mt-1">{kpi.trend}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Requests Column */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Your Requests</h2>
                        <Link href="/contractor/requests" className="text-sm font-medium text-primary hover:underline">View All</Link>
                    </div>

                    <div className="space-y-3">
                        {jobs.length === 0 ? (
                            <div className="p-6 rounded-xl bg-surface border border-dashed border-subtle text-center text-muted">
                                <Briefcase className="w-8 h-8 opacity-50 mx-auto mb-2" />
                                <p>You haven't posted any equipment requests yet.</p>
                            </div>
                        ) : jobs.slice(0, 5).map((req) => {
                            const daysLeft = Math.max(0, Math.ceil((new Date(req.required_from).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                            return (
                                <div
                                    key={req.job_id}
                                    onClick={() => req.status === 'open' && setSelectedJobId(req.job_id === selectedJobId ? null : req.job_id)}
                                    className={`p-4 rounded-xl transition-all shadow-theme-sm group relative overflow-hidden ${req.status !== 'open'
                                        ? 'bg-surface border border-subtle opacity-70 cursor-not-allowed'
                                        : selectedJobId === req.job_id
                                            ? 'bg-primary/10 border border-primary cursor-pointer shadow-[inner_0_0_10px_var(--color-primary-glow)]'
                                            : 'bg-surface border border-subtle hover:border-primary/50 cursor-pointer'
                                        }`}
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <span className="text-xs font-mono text-muted">{req.job_id.split('-')[0]}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${req.status === 'open' ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-muted'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-main mb-3 leading-snug relative z-10 truncate">{req.job_description}</h4>
                                    <div className="flex items-center justify-between text-sm relative z-10">
                                        <span className="flex items-center gap-1.5 font-medium text-muted">
                                            <Clock className="w-3.5 h-3.5" />
                                            {daysLeft > 0 ? `Needs in ${daysLeft}d` : 'Immediate'}
                                        </span>
                                        {req.status === 'open' && (
                                            <span className={`font-bold flex items-center gap-1 transition-colors ${selectedJobId === req.job_id ? 'text-accent-success animate-pulse' : 'text-primary'}`}>
                                                {selectedJobId === req.job_id ? 'Monitoring' : 'Monitor'} <ArrowRight className="w-3 h-3" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Bids Area */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Latest Bids to Review
                            {selectedJobId && <span className="bg-accent-success/20 text-accent-success text-xs px-2 py-0.5 rounded animate-pulse">Live</span>}
                        </h2>

                        {/* View Toggle */}
                        <div className="flex items-center bg-surface-hover p-1 rounded-lg border border-subtle">
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface shadow-sm text-main' : 'text-muted'}`}>
                                <List className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-surface shadow-sm text-main' : 'text-muted'}`}>
                                <MapIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden h-[450px] flex flex-col relative">
                        {viewMode === 'list' ? (
                            <div className="flex-1 flex flex-col">
                                {!selectedJobId ? (
                                    <div className="flex-1 flex items-center justify-center p-8 text-center bg-base/50">
                                        <div>
                                            <Clock className="w-12 h-12 text-primary/50 mx-auto mb-4 animate-pulse" />
                                            <h3 className="text-lg font-bold mb-2">Connecting to Bid Stream...</h3>
                                            <p className="text-muted max-w-sm mx-auto">Select a specific active job from the left to open its dedicated real-time bid monitoring room.</p>
                                        </div>
                                    </div>
                                ) : liveBids.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted bg-base/50">
                                        <Activity className="w-12 h-12 text-primary opacity-50 mx-auto mb-4 animate-bounce" />
                                        <p className="font-bold text-main mb-1">Listening for Bids...</p>
                                        <p className="text-sm max-w-sm">Connection established. Waiting for suppliers to submit their equipment bids.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto flex-1 relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-glow)] blur-[100px] opacity-10 pointer-events-none" />
                                        <table className="w-full text-left border-collapse relative z-10">
                                            <thead className="sticky top-0 bg-surface border-b border-subtle z-20 shadow-sm">
                                                <tr className="text-[11px] uppercase tracking-wider text-muted font-semibold bg-surface-hover/50">
                                                    <th className="p-4">Time</th>
                                                    <th className="p-4">Supplier</th>
                                                    <th className="p-4">Amount</th>
                                                    <th className="p-4">Location</th>
                                                    <th className="p-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-subtle">
                                                <AnimatePresence>
                                                    {liveBids.map((bid, i) => (
                                                        <motion.tr
                                                            key={bid.bid_id || i}
                                                            initial={{ opacity: 0, x: -20, backgroundColor: 'var(--color-primary-glow)' }}
                                                            animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                                                            transition={{ duration: 0.5 }}
                                                            className="hover:bg-surface-hover/30 transition-colors"
                                                        >
                                                            <td className="p-4 text-xs font-mono text-muted">{bid.receivedAt}</td>
                                                            <td className="p-4">
                                                                <p className="font-semibold text-main truncate max-w-[150px]" title={bid.supplier_id}>{bid.supplier_id?.split('-')[0] || 'Unknown'}</p>
                                                                <p className="text-xs text-muted">★ 4.8 Rating (Mocked)</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="font-bold text-lg font-mono">${bid.amount}<span className="text-sm font-normal text-muted">/day</span></span>
                                                            </td>
                                                            <td className="p-4 text-sm text-muted">
                                                                {Math.floor(Math.random() * 20) + 1} mi away
                                                            </td>
                                                            <td className="p-4">
                                                                <button title="Accept Bid" className="px-4 py-1.5 bg-primary/10 hover:bg-primary font-bold hover:text-white text-primary rounded-lg transition-colors text-sm border-2 border-transparent hover:border-primary-hover active:scale-95 flex items-center gap-1">
                                                                    Review <ArrowRight className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 w-full bg-base/50 relative overflow-hidden rounded-b-2xl p-1">
                                <MapView
                                    interactive={true}
                                    zoom={12}
                                    center={{ lat: 37.7749, lng: -122.4194 }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
