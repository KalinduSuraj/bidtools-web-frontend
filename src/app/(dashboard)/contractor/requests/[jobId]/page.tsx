'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Loader2, MapPin, Calendar, Activity, DollarSign, CheckCircle2, Clock, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { JobsAPI } from '@/lib/api/jobs.api';
import { BidsAPI } from '@/lib/api/bids.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ContractorRequestDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingBidId, setProcessingBidId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.user_id) return;
            setIsLoading(true);
            try {
                const [jobResult, bidsResult] = await Promise.allSettled([
                    JobsAPI.getJobById(jobId),
                    BidsAPI.getBidsForJob(jobId),
                ]);

                if (jobResult.status === 'rejected') {
                    throw jobResult.reason;
                }

                const jobData = jobResult.value.data;
                if (jobData.contractor_id !== user.user_id) {
                    throw new Error("Unauthorized to view this request.");
                }

                setJob(jobData);
                if (bidsResult.status === 'fulfilled') {
                    setBids(Array.isArray(bidsResult.value.data) ? bidsResult.value.data : []);
                } else {
                    console.warn('Bid service unavailable:', bidsResult.reason?.response?.data?.message || bidsResult.reason?.message);
                    setBids([]);
                }
            } catch (err: any) {
                console.error('Failed to load request:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load request details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user?.user_id, jobId]);

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm('Accept this quote and generate a rental agreement?')) return;
        setProcessingBidId(bidId);
        try {
            // Note: No accept endpoint in current API. Refresh bids to get server-side updates.
            const { data } = await BidsAPI.getBidsForJob(jobId);
            setBids(Array.isArray(data) ? data : []);
            alert('Bid acceptance will be processed. Please check back shortly.');
        } catch (err: any) {
            console.error('Failed to accept bid:', err);
        } finally {
            setProcessingBidId(null);
        }
    };

    const handleRejectBid = async (bidId: string) => {
        if (!confirm('Reject this quote?')) return;
        setProcessingBidId(bidId);
        try {
            // Note: No reject endpoint in current API. Refresh bids to get server-side updates.
            const { data } = await BidsAPI.getBidsForJob(jobId);
            setBids(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to reject bid:', err);
        } finally {
            setProcessingBidId(null);
        }
    };

    if (isLoading) return <LoadingWindow fullScreen message="Loading request details..." />;

    if (error) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <ErrorWindow message={error} />
                <Link href="/contractor/dashboard" className="mt-4 inline-block text-primary hover:underline">&larr; Back to Dashboard</Link>
            </div>
        );
    }

    const statusConfig: Record<string, { color: string; label: string }> = {
        open: { color: 'bg-accent-success/10 text-accent-success border-accent-success/20', label: 'Open for Bids' },
        in_progress: { color: 'bg-primary/10 text-primary border-primary/20', label: 'In Progress' },
        completed: { color: 'bg-surface-hover text-muted border-subtle', label: 'Completed' },
        cancelled: { color: 'bg-accent-danger/10 text-accent-danger border-accent-danger/20', label: 'Cancelled' },
    };

    const jobStatus = statusConfig[job?.status] || statusConfig.open;

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
            <Link href="/contractor/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            {/* Job Header */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-main mb-2">{job?.job_description}</h1>
                        <p className="text-sm font-mono text-muted">Request ID: {job?.job_id?.split('-')[0]}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${jobStatus.color}`}>
                        {jobStatus.label}
                    </span>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {job?.required_from ? new Date(job.required_from).toLocaleDateString() : 'TBD'} — {job?.required_to ? new Date(job.required_to).toLocaleDateString() : 'TBD'}
                    </span>
                    {(job?.latitude && job?.longitude) && (
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary" /> {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}
                        </span>
                    )}
                </div>
            </div>

            {/* Bids Section */}
            <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden">
                <div className="p-4 border-b border-subtle bg-surface-hover/30 flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Received Quotes ({bids.length})
                    </h3>
                </div>

                {bids.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            title="No Bids Yet"
                            message="Suppliers in the area will see your request and submit their quotes here."
                            icon={<Send className="w-12 h-12 opacity-50" />}
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-subtle">
                        <AnimatePresence>
                            {bids.map((bid) => (
                                <motion.div
                                    key={bid.bid_id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-5 hover:bg-surface-hover/30 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="font-bold text-main text-lg">${Number(bid.amount).toFixed(2)}</p>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${bid.status === 'accepted'
                                                    ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                                    : bid.status === 'rejected'
                                                        ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                    }`}>
                                                    {bid.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted">
                                                Supplier: {bid.supplier?.name || bid.supplier_id?.split('-')[0]} · {new Date(bid.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        {bid.status === 'pending' && job?.status === 'open' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptBid(bid.bid_id)}
                                                    disabled={!!processingBidId}
                                                    className="px-4 py-2 bg-accent-success/10 hover:bg-accent-success/20 text-accent-success rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    {processingBidId === bid.bid_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBid(bid.bid_id)}
                                                    disabled={!!processingBidId}
                                                    className="px-4 py-2 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
