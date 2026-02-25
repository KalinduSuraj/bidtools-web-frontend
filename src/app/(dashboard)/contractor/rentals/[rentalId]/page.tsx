'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar, DollarSign, MapPin, Package, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RentalsAPI } from '@/lib/api/rentals.api';
import { JobsAPI } from '@/lib/api/jobs.api';
import { ItemsAPI } from '@/lib/api/items.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

export default function ContractorRentalDetailPage({ params }: { params: { rentalId: string } }) {
    const { user } = useAuth();
    const [rental, setRental] = useState<any>(null);
    const [job, setJob] = useState<any>(null);
    const [item, setItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const { data: rentalData } = await RentalsAPI.getRentalById(params.rentalId);
                setRental(rentalData);

                const [jobRes, itemRes] = await Promise.allSettled([
                    JobsAPI.getJobById(rentalData.job_id),
                    ItemsAPI.getItemById(rentalData.item_id),
                ]);

                if (jobRes.status === 'fulfilled') setJob(jobRes.value.data);
                if (itemRes.status === 'fulfilled') setItem(itemRes.value.data);
            } catch (err: any) {
                console.error('Failed to load rental:', err);
                setError(err.response?.data?.message || 'Failed to load rental details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [params.rentalId]);

    if (isLoading) return <LoadingWindow fullScreen message="Loading rental agreement..." />;

    if (error) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <ErrorWindow message={error} />
                <Link href="/contractor/rentals" className="mt-4 inline-block text-primary hover:underline">&larr; Back to Rentals</Link>
            </div>
        );
    }

    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
        active: { color: 'bg-accent-success/10 text-accent-success border-accent-success/20', icon: <CheckCircle2 className="w-4 h-4" /> },
        completed: { color: 'bg-primary/10 text-primary border-primary/20', icon: <CheckCircle2 className="w-4 h-4" /> },
        cancelled: { color: 'bg-accent-danger/10 text-accent-danger border-accent-danger/20', icon: <XCircle className="w-4 h-4" /> },
    };

    const status = statusConfig[rental?.status] || statusConfig.active;

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
            <Link href="/contractor/rentals" className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Rentals
            </Link>

            {/* Header */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-main mb-1">Rental Agreement</h1>
                        <p className="text-sm font-mono text-muted">ID: {rental?.rental_id?.split('-')[0]}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${status.color}`}>
                        {status.icon} {rental?.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rental Details */}
                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-4">
                    <h3 className="font-bold text-lg border-b border-subtle pb-3">Rental Details</h3>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted">Rental Period</p>
                                <p className="text-sm font-medium text-main">
                                    {rental?.start_date ? new Date(rental.start_date).toLocaleDateString() : 'TBD'} — {rental?.end_date ? new Date(rental.end_date).toLocaleDateString() : 'TBD'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <DollarSign className="w-4 h-4 text-accent-success mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted">Total Cost</p>
                                <p className="text-xl font-black text-main">${Number(rental?.total_cost || 0).toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-muted mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted">Created</p>
                                <p className="text-sm text-main">{rental?.created_at ? new Date(rental.created_at).toLocaleString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Equipment & Job Info */}
                <div className="space-y-6">
                    {item && (
                        <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-3">
                            <h3 className="font-bold text-lg border-b border-subtle pb-3 flex items-center gap-2">
                                <Package className="w-5 h-5 text-muted" /> Equipment
                            </h3>
                            <div className="flex justify-between py-2 border-b border-subtle/50">
                                <span className="text-sm text-muted">Category</span>
                                <span className="text-sm font-semibold text-main capitalize">{item.category}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-subtle/50">
                                <span className="text-sm text-muted">Brand / Model</span>
                                <span className="text-sm text-main">{item.brand} {item.model}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-muted">Daily Rate</span>
                                <span className="text-sm font-bold text-primary">${item.daily_rate}/day</span>
                            </div>
                        </div>
                    )}

                    {job && (
                        <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-3">
                            <h3 className="font-bold text-lg border-b border-subtle pb-3">Job Request</h3>
                            <p className="text-sm text-main">{job.description || job.job_description}</p>
                            {(job.latitude && job.longitude) && (
                                <p className="text-xs text-muted flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {job.latitude}, {job.longitude}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
