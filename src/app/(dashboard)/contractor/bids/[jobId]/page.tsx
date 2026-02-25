'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, DollarSign, Activity, AlertCircle, ShieldCheck, CheckCircle2, TrendingUp, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JobsAPI } from '@/lib/api/jobs.api';
import { BidsAPI } from '@/lib/api/bids.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

export default function JobBidsPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [job, setJob] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processBidId, setProcessBidId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBids = async () => {
            if (!user?.user_id) return;
            setIsLoading(true);
            try {
                const [jobResult, bidsResult] = await Promise.allSettled([
                    JobsAPI.getJobById(jobId),
                    BidsAPI.getBidsForJob(jobId)
                ]);

                if (jobResult.status === 'rejected') {
                    throw jobResult.reason;
                }

                const jobData = jobResult.value.data;
                // Verify contractor owns this job
                if (jobData.contractor_id !== user.user_id) {
                    throw new Error("Unauthorized to view this job's bids.");
                }

                setJob(jobData);
                if (bidsResult.status === 'fulfilled') {
                    setBids(Array.isArray(bidsResult.value.data) ? bidsResult.value.data : []);
                } else {
                    console.warn('Bid service unavailable:', bidsResult.reason?.response?.data?.message || bidsResult.reason?.message);
                    setBids([]);
                }
            } catch (err: any) {
                console.error("Failed to load bids:", err);
                setError(err.response?.data?.message || err.message || "Failed to load bids for this request.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBids();
    }, [user?.user_id, jobId]);

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm("Are you sure you want to accept this quote and generate a rental agreement?")) return;

        setProcessBidId(bidId);
        try {
            // Note: Bid acceptance triggers rental creation. 
            // The backend may not have a direct "accept bid" endpoint.
            // Using rental creation as the acceptance mechanism.
            alert("To accept a bid, please create a rental agreement from the Rentals page.");
            router.push('/contractor/rentals');
        } catch (err: any) {
            console.error("Failed to accept bid:", err);
            alert(err.response?.data?.message || "An error occurred while accepting the bid.");
        } finally {
            setProcessBidId(null);
        }
    };

    if (isLoading) {
        return <LoadingWindow fullScreen message="Loading Competitive Bids..." />;
    }

    if (error && !job) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <ErrorWindow message={error} />
                <Link href="/contractor/dashboard" className="mt-4 inline-block text-primary hover:underline">
                    &larr; Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 mb-8">
                <div>
                    <Link href="/contractor/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" /> Competitive Bids
                    </h1>
                    <p className="text-muted">Review incoming quotes for your <span className="text-main font-semibold">"{job?.job_description}"</span> request.</p>
                </div>

                <div className="bg-surface border border-subtle p-3 rounded-xl flex items-center gap-4 text-sm font-bold shadow-theme-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent-success animate-pulse" />
                        <span className={job?.status === 'open' ? 'text-accent-success' : 'text-muted'}>
                            {job?.status === 'open' ? 'Bidding Live' : 'Closed'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-muted" /> Received Quotes ({bids.length})
                    </h3>
                    <button className="px-3 py-1.5 flex items-center gap-2 rounded-lg bg-surface hover:bg-surface-hover border border-subtle text-sm font-medium transition-colors">
                        <Filter className="w-4 h-4" /> Sort by Lowest Rate
                    </button>
                </div>

                {bids.length === 0 ? (
                    <div className="bg-surface border border-subtle rounded-2xl p-8 shadow-theme-sm mt-4">
                        <EmptyState
                            title="Awaiting Bids"
                            message="We've broadcasted your request to suppliers within your exact radius. Active quotes will appear here in real-time."
                            icon={<Activity className="w-12 h-12 opacity-30 text-primary animate-pulse" />}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bids.sort((a, b) => (a.amount || a.bid_value || 0) - (b.amount || b.bid_value || 0)).map((bid, index) => {
                            const isBestPrice = index === 0 && bids.length > 1;
                            const isAccepted = bid.status === 'accepted';
                            const isClosed = job.status !== 'open';

                            return (
                                <motion.div
                                    key={bid.bid_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative p-6 rounded-2xl border ${isAccepted ? 'border-accent-success bg-accent-success/5' :
                                            isBestPrice ? 'border-primary shadow-[0_0_15px_var(--color-primary-glow)] bg-primary/5' :
                                                'border-subtle bg-surface shadow-theme-sm'
                                        } group overflow-hidden`}
                                >
                                    {isBestPrice && !isAccepted && (
                                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                            Best Offer
                                        </div>
                                    )}
                                    {isAccepted && (
                                        <div className="absolute top-0 right-0 bg-accent-success text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                            Winning Bid
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-4 pt-2">
                                        <div>
                                            <p className="text-xs font-semibold text-muted tracking-tight mb-1">Total Deal Amount</p>
                                            <p className="text-3xl font-black text-main font-mono">${bid.amount || bid.bid_value}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-subtle mb-6">
                                        <div>
                                            <p className="text-xs text-muted mb-0.5">Supplier Rating</p>
                                            <div className="flex items-center gap-1 font-bold text-sm text-main">
                                                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                                Verified Network Partner
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted mb-0.5">Inventory Match</p>
                                            <p className="text-sm font-semibold truncate" title={bid.item_id}>#{bid.item_id}</p>
                                        </div>
                                    </div>

                                    {(job.status === 'open' && bid.status === 'pending') ? (
                                        <button
                                            onClick={() => handleAcceptBid(bid.bid_id)}
                                            disabled={processBidId === bid.bid_id}
                                            className="w-full py-3 bg-main text-base hover:bg-neutral-800 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95 disabled:opacity-50"
                                        >
                                            {processBidId === bid.bid_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                            Accept & Initiate Agreement
                                        </button>
                                    ) : isAccepted ? (
                                        <div className="w-full py-3 bg-transparent border-2 border-accent-success text-accent-success rounded-xl font-bold text-sm flex justify-center items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Locked In
                                        </div>
                                    ) : (
                                        <div className="w-full py-3 bg-surface-hover text-muted rounded-xl font-bold text-sm flex justify-center items-center">
                                            Offer Expired
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
