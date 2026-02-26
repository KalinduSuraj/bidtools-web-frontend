'use client';

import { useState, useEffect, useRef, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, DollarSign, Activity, AlertCircle, ShieldCheck, CheckCircle2, TrendingUp, Filter, Radio, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JobsAPI } from '@/lib/api/jobs.api';
import { BidsAPI } from '@/lib/api/bids.api';
import { BiddingAPI } from '@/lib/api/bidding.api';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { ItemsAPI } from '@/lib/api/items.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

/** Helper: parse the bids object from an auction into a flat array */
function parseAuctionBids(bidsObj: Record<string, any>, jobId: string): any[] {
    if (!bidsObj || typeof bidsObj !== 'object') return [];
    return Object.entries(bidsObj).map(([firebaseKey, val]) => {
        const bid = typeof val === 'object' ? val : {};
        return {
            bid_id: firebaseKey,
            job_id: jobId,
            supplier_id: bid.supplierId || bid.supplier_id || '',
            item_id: bid.itemId || bid.item_id || '',
            amount: Number(bid.amount || 0),
            status: bid.status || 'pending',
            created_at: bid.timestamp ? new Date(bid.timestamp).toISOString() : new Date().toISOString(),
            timestamp: bid.timestamp,
            _fromRtdb: true,
        };
    });
}

export default function JobBidsPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [job, setJob] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [rtdbBids, setRtdbBids] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processBidId, setProcessBidId] = useState<string | null>(null);
    const [sseConnected, setSseConnected] = useState(false);
    const [supplierProfiles, setSupplierProfiles] = useState<Record<string, any>>({});
    const [itemDetails, setItemDetails] = useState<Record<string, any>>({});
    const eventSourceRef = useRef<EventSource | null>(null);

    // Fetch job + existing bids from main API (RTDB data comes from SSE)
    useEffect(() => {
        const fetchBids = async () => {
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
                console.error("Failed to load bids:", err);
                setError(err.response?.data?.message || err.message || "Failed to load bids for this request.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBids();
    }, [user?.user_id, jobId]);

    // Connect to SSE stream — SSE sends the full auction state immediately on connect + on every change
    // This is the ONLY way to get RTDB data (the /jobs/:id REST endpoint does not exist)
    useEffect(() => {
        const streamUrl = BiddingAPI.getStreamUrl(jobId);
        const sse = new EventSource(streamUrl);
        eventSourceRef.current = sse;

        sse.onopen = () => {
            setSseConnected(true);
        };

        sse.onmessage = (event) => {
            try {
                const auctionState = JSON.parse(event.data);
                console.log('[SSE] Auction state received:', JSON.stringify(auctionState, null, 2));

                const bidsObj = auctionState?.bids;
                if (bidsObj && typeof bidsObj === 'object' && Object.keys(bidsObj).length > 0) {
                    const parsed = parseAuctionBids(bidsObj, jobId);
                    setRtdbBids(parsed);
                } else {
                    setRtdbBids([]);
                }
            } catch (err) {
                console.error("Error parsing SSE data:", err, 'Raw:', event.data);
            }
        };

        sse.onerror = () => {
            setSseConnected(false);
        };

        return () => {
            sse.close();
            eventSourceRef.current = null;
        };
    }, [jobId]);

    // Fetch supplier details for all unique supplier IDs
    useEffect(() => {
        const allSupplierIds = new Set<string>();
        [...bids, ...rtdbBids].forEach(b => {
            const sid = b.supplier_id || b.supplierId;
            if (sid) allSupplierIds.add(sid);
        });

        const newIds = [...allSupplierIds].filter(id => !supplierProfiles[id]);
        if (newIds.length === 0) return;

        const fetchSupplierDetails = async () => {
            const results = await Promise.allSettled(
                newIds.map(async (id) => {
                    try {
                        return await ProfilesAPI.getSupplierProfile(id);
                    } catch {
                        return await ProfilesAPI.getProfileByUserId(id);
                    }
                })
            );
            const newProfiles: Record<string, any> = {};
            results.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    const profile = result.value.data;
                    newProfiles[newIds[idx]] = Array.isArray(profile) ? profile[0] : profile;
                }
            });
            if (Object.keys(newProfiles).length > 0) {
                setSupplierProfiles(prev => ({ ...prev, ...newProfiles }));
            }
        };
        fetchSupplierDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bids, rtdbBids]);

    // Fetch item details for all unique item IDs
    useEffect(() => {
        const allItemIds = new Set<string>();
        [...bids, ...rtdbBids].forEach(b => {
            const iid = b.item_id || b.itemId;
            if (iid) allItemIds.add(iid);
        });

        const newIds = [...allItemIds].filter(id => !itemDetails[id]);
        if (newIds.length === 0) return;

        const fetchItems = async () => {
            const results = await Promise.allSettled(
                newIds.map(id => ItemsAPI.getItemById(id))
            );
            const newItems: Record<string, any> = {};
            results.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    newItems[newIds[idx]] = result.value.data;
                }
            });
            if (Object.keys(newItems).length > 0) {
                setItemDetails(prev => ({ ...prev, ...newItems }));
            }
        };
        fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bids, rtdbBids]);

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm("Are you sure you want to accept this quote and generate a rental agreement?")) return;

        setProcessBidId(bidId);
        try {
            alert("To accept a bid, please create a rental agreement from the Rentals page.");
            router.push('/contractor/rentals');
        } catch (err: any) {
            console.error("Failed to accept bid:", err);
            alert(err.response?.data?.message || "An error occurred while accepting the bid.");
        } finally {
            setProcessBidId(null);
        }
    };

    // Merge existing bids + RTDB bids for display (dedup by bid_id)
    const allBids = (() => {
        const seen = new Set<string>();
        const merged: any[] = [];

        bids.forEach(b => {
            if (b.bid_id) seen.add(b.bid_id);
            const sid = b.supplier_id || b.supplierId;
            const iid = b.item_id || b.itemId;
            merged.push({
                ...b,
                supplier: supplierProfiles[sid] || b.supplier,
                item: itemDetails[iid] || b.item,
            });
        });

        rtdbBids.forEach(b => {
            if (b.bid_id && seen.has(b.bid_id)) return;
            if (b.bid_id) seen.add(b.bid_id);
            const sid = b.supplier_id;
            const iid = b.item_id;
            merged.push({
                ...b,
                supplier: supplierProfiles[sid],
                item: itemDetails[iid],
                _fromRtdb: true,
            });
        });

        return merged;
    })();

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
        <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 mb-8">
                <div>
                    <Link href="/contractor/dashboard" className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" /> Live Bidding Monitor
                    </h1>
                    <p className="text-muted">Real-time bids for <span className="text-main font-semibold">&quot;{job?.job_description}&quot;</span></p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${
                        sseConnected
                            ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                            : 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                    }`}>
                        {sseConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        {sseConnected ? 'Live Stream Active' : 'Reconnecting...'}
                    </div>
                    <div className="bg-surface border border-subtle p-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-theme-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent-success animate-pulse" />
                        <span className={job?.status === 'open' ? 'text-accent-success' : 'text-muted'}>
                            {job?.status === 'open' ? 'Bidding Live' : 'Closed'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left: Existing Bids / Quotes */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-muted" /> Received Quotes ({allBids.length})
                    </h3>

                    {allBids.length === 0 ? (
                        <div className="bg-surface border border-subtle rounded-2xl p-8 shadow-theme-sm">
                            <EmptyState
                                title="Awaiting Bids"
                                message="Suppliers will submit quotes here. Live bids appear in the stream panel on the right."
                                icon={<Activity className="w-12 h-12 opacity-30 text-primary animate-pulse" />}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allBids.sort((a, b) => (a.amount || a.bid_value || 0) - (b.amount || b.bid_value || 0)).map((bid, index) => {
                                const isBestPrice = index === 0 && allBids.length > 1;
                                const isAccepted = bid.status === 'accepted';

                                return (
                                    <motion.div
                                        key={bid.bid_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`relative p-5 rounded-2xl border ${isAccepted ? 'border-accent-success bg-accent-success/5' :
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

                                        <div className="flex justify-between items-start mb-3 pt-1">
                                            <div>
                                                <p className="text-xs font-semibold text-muted mb-1">Total Amount</p>
                                                <p className="text-2xl font-black text-main font-mono">${bid.amount || bid.bid_value}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-3 border-t border-subtle mb-4 text-sm">
                                            <div>
                                                <span className="text-muted">Supplier: </span>
                                                <span className="font-semibold text-main">{bid.supplier?.company_name || bid.supplier?.name || bid.supplier_id?.split('-')[0] || 'Unknown'}</span>
                                                {bid._fromRtdb && <span className="ml-2 text-[10px] text-primary font-bold">RTDB</span>}
                                            </div>
                                            {(bid.item_id || bid.item) && (
                                                <div>
                                                    <span className="text-muted">Item: </span>
                                                    <span className="font-semibold text-main">{bid.item?.name || bid.item_id?.split('-')[0] || ''}</span>
                                                </div>
                                            )}
                                        </div>

                                        {(job?.status === 'open' && bid.status === 'pending') ? (
                                            <button
                                                onClick={() => handleAcceptBid(bid.bid_id)}
                                                disabled={processBidId === bid.bid_id}
                                                className="w-full py-2.5 bg-main text-base hover:bg-neutral-800 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                            >
                                                {processBidId === bid.bid_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                Accept Quote
                                            </button>
                                        ) : isAccepted ? (
                                            <div className="w-full py-2.5 bg-transparent border-2 border-accent-success text-accent-success rounded-xl font-bold text-sm flex justify-center items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Locked In
                                            </div>
                                        ) : null}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Live SSE Bid Stream (real-time from RTDB) */}
                <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden h-[calc(100vh-280px)] max-h-[800px]">
                    <div className="p-4 border-b border-subtle bg-surface-hover/50 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <Radio className={`w-5 h-5 ${sseConnected ? 'text-accent-success animate-pulse' : 'text-muted'}`} />
                            Live Bid Stream
                        </h3>
                        <span className="text-xs text-muted font-mono">{rtdbBids.length} bid{rtdbBids.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        {rtdbBids.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted h-full">
                                <Activity className={`w-12 h-12 mx-auto mb-4 ${sseConnected ? 'text-primary opacity-50 animate-bounce' : 'opacity-30'}`} />
                                <p className="font-bold text-main mb-1">{sseConnected ? 'Listening for Bids...' : 'Connecting...'}</p>
                                <p className="text-sm">Real-time bids from suppliers will appear here as they come in.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-subtle">
                                <AnimatePresence>
                                    {[...rtdbBids].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((bid, i) => {
                                        const sid = bid.supplier_id;
                                        const iid = bid.item_id;
                                        const supplierName = supplierProfiles[sid]?.company_name || supplierProfiles[sid]?.name || sid?.split('-')[0] || 'Unknown';
                                        const itemName = itemDetails[iid]?.name || iid?.split('-')[0] || '';
                                        return (
                                            <motion.div
                                                key={bid.bid_id || `live-${i}`}
                                                initial={{ opacity: 0, x: -20, backgroundColor: 'var(--color-primary-glow)' }}
                                                animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                                                transition={{ duration: 0.5 }}
                                                className="p-4 hover:bg-surface-hover/30 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-lg font-black font-mono text-main">${Number(bid.amount || 0).toFixed(0)}</span>
                                                    <span className="text-xs text-muted font-mono">{bid.created_at ? new Date(bid.created_at).toLocaleTimeString() : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted">
                                                    <span>Supplier: <span className="font-semibold text-main">{supplierName}</span></span>
                                                    {itemName && <span>Item: <span className="font-mono">{itemName}</span></span>}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
