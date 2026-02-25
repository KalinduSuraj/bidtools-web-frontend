'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle2, AlertCircle, Clock, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RentalsAPI } from '@/lib/api/rentals.api';
import { JobsAPI } from '@/lib/api/jobs.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

interface RentalWithDetails {
    rental_id: string;
    start_date: string;
    end_date: string;
    total_cost: number;
    status: string;
    job_id: string;
    item_id: string;
    job_description?: string;
}

export default function ContractorRentalsPage() {
    const { user } = useAuth();
    const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchRentals = async () => {
            if (!user?.user_id) return;
            setIsLoading(true);
            try {
                // Fetch basic rentals
                const { data } = await RentalsAPI.getContractorRentals(user.user_id);
                const rawRentals = Array.isArray(data) ? data : [];

                // Attempt to enrich with Job Descriptions for a better UX
                const enriched = await Promise.all(
                    rawRentals.map(async (r: any) => {
                        try {
                            const jobRes = await JobsAPI.getJobById(r.job_id);
                            return { ...r, job_description: jobRes.data.job_description };
                        } catch {
                            return { ...r, job_description: 'Unknown Job' };
                        }
                    })
                );

                setRentals(enriched);
            } catch (err: any) {
                console.error("Failed to load rentals:", err);
                setError(err.response?.data?.message || "Failed to load active rentals.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRentals();
    }, [user?.user_id]);

    const filteredRentals = rentals.filter(r =>
        r.rental_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.job_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <LoadingWindow fullScreen message="Loading Rental Agreements..." />;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4">
                <ErrorWindow message={error} />
                <Link href="/contractor/dashboard" className="mt-4 inline-block text-primary hover:underline">
                    &larr; Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-primary" /> Active Rentals
                    </h1>
                    <p className="text-muted">Manage your ongoing equipment rentals and prepare for upcoming deliveries.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search agreements or jobs..."
                        className="w-full bg-surface border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm shadow-theme-sm"
                    />
                </div>
            </div>

            {/* Content */}
            {rentals.length === 0 ? (
                <div className="bg-surface border border-subtle rounded-2xl p-12 shadow-theme-sm text-center">
                    <EmptyState
                        title="No Active Rentals"
                        message="You haven't initiated any rental agreements yet. Accept a bid to start tracking equipment here."
                        icon={<Briefcase className="w-12 h-12 opacity-30 text-primary" />}
                    />
                    <Link href="/contractor/requests/new" className="mt-6 inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-theme-sm hover:bg-primary-hover transition-colors">
                        Create New Request
                    </Link>
                </div>
            ) : filteredRentals.length === 0 ? (
                <div className="bg-surface border border-subtle rounded-2xl p-12 shadow-theme-sm text-center text-muted">
                    No rentals match your search criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRentals.map((rental) => (
                        <motion.div
                            key={rental.rental_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface border border-subtle rounded-3xl p-6 shadow-theme-sm flex flex-col justify-between group hover:border-primary/50 transition-colors"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-surface-hover border border-subtle text-muted">
                                        Agreement #{rental.rental_id.split('-')[0]}
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded border ${rental.status === 'active' ? 'bg-accent-success/10 border-accent-success/20 text-accent-success' :
                                            rental.status === 'completed' ? 'bg-primary/10 border-primary/20 text-primary' :
                                                'bg-surface-hover border-subtle text-muted'
                                        }`}>
                                        {rental.status === 'active' && <Clock className="w-3 h-3" />}
                                        {rental.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-main line-clamp-2 leading-tight">{rental.job_description}</h3>
                                    <p className="text-sm text-muted mt-1 font-mono">Item: {rental.item_id.split('-')[0]}</p>
                                </div>

                                <div className="space-y-3 py-4 border-y border-subtle/50 my-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted flex items-center gap-2"><Calendar className="w-4 h-4" /> Period</span>
                                        <span className="font-medium">
                                            {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted flex items-center gap-2"><MapPin className="w-4 h-4" /> Job ID</span>
                                        <Link href={`/contractor/requests/${rental.job_id}`} className="font-medium text-primary hover:underline truncate w-32 text-right">
                                            {rental.job_id}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1">Total Cost</p>
                                    <p className="text-2xl font-black text-main">${rental.total_cost || 0}</p>
                                </div>
                                <button className="px-5 py-2.5 bg-base border border-subtle hover:bg-surface-hover text-sm font-bold rounded-xl transition-colors">
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
