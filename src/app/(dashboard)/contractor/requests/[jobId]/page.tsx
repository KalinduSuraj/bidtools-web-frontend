'use client';

import { useState, useEffect, useRef, use } from 'react';
import { ArrowLeft, Loader2, MapPin, Calendar, Activity, DollarSign, CheckCircle2, Clock, AlertCircle, Send, Radio, Wifi, WifiOff, Gavel, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { JobsAPI } from '@/lib/api/jobs.api';
import { BidsAPI } from '@/lib/api/bids.api';
import { BiddingAPI } from '@/lib/api/bidding.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ContractorRequestDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [liveBids, setLiveBids] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingBidId, setProcessingBidId] = useState<string | null>(null);
    const [sseConnected, setSseConnected] = useState(false);
    const [auctionActive, setAuctionActive] = useState(false);
    const [isStartingAuction, setIsStartingAuction] = useState(false);
    const [auctionError, setAuctionError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

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

    // Connect to live SSE stream for real-time bids
    useEffect(() => {
        const streamUrl = BiddingAPI.getStreamUrl(jobId);
        const sse = new EventSource(streamUrl);
        eventSourceRef.current = sse;

        sse.onopen = () => setSseConnected(true);

        sse.onmessage = (event) => {
            try {
                const newBid = JSON.parse(event.data);
                setLiveBids(prev => [{ ...newBid, receivedAt: new Date().toLocaleTimeString() }, ...prev]);
            } catch (err) {
                console.error("Error parsing SSE data:", err);
            }
        };

        sse.onerror = () => setSseConnected(false);

        return () => {
            sse.close();
            eventSourceRef.current = null;
        };
    }, [jobId]);

    // Register this job in the bidding service so suppliers can place live bids
    const handleStartAuction = async () => {
        if (!job) return;
        setIsStartingAuction(true);
        setAuctionError(null);
        try {
            await BiddingAPI.createJobAuction({
                jobId: job.job_id || jobId,
                jobDetails: {
                    description: job.job_description,
                    latitude: job.latitude,
                    longitude: job.longitude,
                },
                startTime: Date.now(),
                endTime: Math.max(job.required_to ? new Date(job.required_to).getTime() : 0, Date.now() + 7 * 86400000),
                startingPrice: 0,
            });
            setAuctionActive(true);
        } catch (err: any) {
            // If job already registered (409), treat as success
            if (err.response?.status === 409) {
                setAuctionActive(true);
            } else {
                console.error('Failed to start auction:', err);
                setAuctionError(err.response?.data?.message || 'Failed to register job in bidding service.');
            }
        } finally {
            setIsStartingAuction(false);
        }
    };

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm('Accept this quote and generate a rental agreement?')) return;
        setProcessingBidId(bidId);
        try {
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
        <div className="max-w-5xl mx-auto py-8 animate-in fade-in duration-500">
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
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                            sseConnected
                                ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                : 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                        }`}>
                            {sseConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                            {sseConnected ? 'Live' : 'Offline'}
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${jobStatus.color}`}>
                            {jobStatus.label}
                        </span>
                    </div>
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
                    <Link
                        href={`/contractor/bids/${jobId}`}
                        className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
                    >
                        <Activity className="w-4 h-4" /> Open Full Bid Monitor
                    </Link>
                </div>

                {/* Start Live Bidding Action */}
                {!auctionActive && job?.status === 'open' && (
                    <div className="mt-5 pt-5 border-t border-subtle">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-main flex items-center gap-2">
                                    <Gavel className="w-4 h-4 text-primary" /> Enable Live Bidding
                                </h3>
                                <p className="text-xs text-muted mt-1">
                                    Register this job in the bidding service so suppliers can place real-time bids.
                                </p>
                            </div>
                            <button
                                onClick={handleStartAuction}
                                disabled={isStartingAuction}
                                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-theme-md transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
                            >
                                {isStartingAuction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                Start Live Bidding
                            </button>
                        </div>
                        {auctionError && (
                            <div className="mt-3 p-3 rounded-lg bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {auctionError}
                            </div>
                        )}
                    </div>
                )}

                {auctionActive && (
                    <div className="mt-5 pt-5 border-t border-subtle">
                        <div className="flex items-center gap-2 text-accent-success text-sm font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Live Bidding Active — Suppliers can now bid on this job in real-time.
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bids Section - 3 cols */}
                <div className="lg:col-span-3 bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden">
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

                {/* Live Stream Panel - 2 cols */}
                <div className="lg:col-span-2 bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden h-[500px] lg:h-auto">
                    <div className="p-4 border-b border-subtle bg-surface-hover/30 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2 text-sm">
                            <Radio className={`w-4 h-4 ${sseConnected ? 'text-accent-success animate-pulse' : 'text-muted'}`} />
                            Live Stream
                        </h3>
                        <span className="text-xs text-muted font-mono">{liveBids.length} incoming</span>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        {liveBids.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-6 text-muted h-full">
                                <Activity className={`w-10 h-10 mx-auto mb-3 ${sseConnected ? 'text-primary opacity-50 animate-bounce' : 'opacity-30'}`} />
                                <p className="font-bold text-main text-sm mb-1">{sseConnected ? 'Listening...' : 'Connecting...'}</p>
                                <p className="text-xs">Live bids appear here in real-time.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-subtle">
                                <AnimatePresence>
                                    {liveBids.map((bid, i) => (
                                        <motion.div
                                            key={bid.bid_id || `live-${i}`}
                                            initial={{ opacity: 0, x: -10, backgroundColor: 'var(--color-primary-glow)' }}
                                            animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                                            transition={{ duration: 0.4 }}
                                            className="p-3 hover:bg-surface-hover/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-base font-black font-mono text-main">${bid.amount}</span>
                                                <span className="text-[10px] text-muted font-mono">{bid.receivedAt}</span>
                                            </div>
                                            <p className="text-xs text-muted">
                                                Supplier: <span className="font-semibold text-main">{bid.supplierId?.split('-')[0] || 'Unknown'}</span>
                                            </p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
