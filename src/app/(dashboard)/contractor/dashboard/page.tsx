'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Clock, CheckCircle2, Map as MapIcon, List, ArrowRight, MapPin, Activity, ShieldCheck, AlertTriangle, Gavel, Loader2, Zap, DollarSign, User, Package, X, Check, Radio } from 'lucide-react';
import Link from 'next/link';
import { JobsAPI } from '@/lib/api/jobs.api';
import { RentalsAPI } from '@/lib/api/rentals.api';
import { BidsAPI } from '@/lib/api/bids.api';
import { BiddingAPI } from '@/lib/api/bidding.api';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { ItemsAPI } from '@/lib/api/items.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';

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
import { MapView } from '@/components/map/MapView';
import { useAuth } from '@/contexts/AuthContext';

export default function ContractorDashboard() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [existingBids, setExistingBids] = useState<any[]>([]);
    const [rtdbBids, setRtdbBids] = useState<any[]>([]);
    const [bidsLoading, setBidsLoading] = useState(false);
    const [supplierProfiles, setSupplierProfiles] = useState<Record<string, any>>({});
    const [itemDetails, setItemDetails] = useState<Record<string, any>>({});
    const [stats, setStats] = useState({
        activeRequests: 0,
        awardedJobs: 0,
        totalSpent: 0
    });
    const [jobs, setJobs] = useState<any[]>([]);
    const [auctionJobs, setAuctionJobs] = useState<Set<string>>(new Set());
    const [startingAuctionId, setStartingAuctionId] = useState<string | null>(null);

    // Bid confirmation state
    const [confirmingBidId, setConfirmingBidId] = useState<string | null>(null);
    const [selectedBidDetail, setSelectedBidDetail] = useState<any | null>(null);
    const [supplierProfile, setSupplierProfile] = useState<any | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<any | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchContractorData = async () => {
            if (!user?.user_id) return;

            try {
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

                // Probe which open jobs have existing auctions via SSE
                // The /stream endpoint returns 200 + first event if auction exists
                const openJobs = validJobs.filter(j => j.status === 'open');
                if (openJobs.length > 0) {
                    const activeAuctions = new Set<string>();
                    const probes = openJobs.map(j => {
                        return new Promise<void>((resolve) => {
                            const probeSse = new EventSource(BiddingAPI.getStreamUrl(j.job_id));
                            const timeout = setTimeout(() => {
                                probeSse.close();
                                resolve();
                            }, 3000); // 3s timeout
                            probeSse.onmessage = (event) => {
                                clearTimeout(timeout);
                                probeSse.close();
                                try {
                                    const data = JSON.parse(event.data);
                                    if (data && data.id) {
                                        activeAuctions.add(j.job_id);
                                        console.log(`[Init] Auction exists for job ${j.job_id}:`, data.status);
                                    }
                                } catch { /* ignore parse errors */ }
                                resolve();
                            };
                            probeSse.onerror = () => {
                                clearTimeout(timeout);
                                probeSse.close();
                                resolve();
                            };
                        });
                    });
                    await Promise.all(probes);
                    if (activeAuctions.size > 0) {
                        setAuctionJobs(activeAuctions);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch contractor data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContractorData();
    }, [user]);

    // When a job is selected, fetch existing bids from main API AND connect SSE for RTDB data
    useEffect(() => {
        if (!selectedJobId) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setExistingBids([]);
            setRtdbBids([]);
            setSelectedBidDetail(null);
            setSupplierProfile(null);
            return;
        }

        // Fetch existing bids from main backend only
        // (RTDB data comes from SSE — the /jobs/:id REST endpoint does not exist)
        const fetchBids = async () => {
            setBidsLoading(true);
            try {
                const { data } = await BidsAPI.getBidsForJob(selectedJobId);
                setExistingBids(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.warn('Main bid API unavailable:', err?.message);
                setExistingBids([]);
            } finally {
                setBidsLoading(false);
            }
        };
        fetchBids();

        setSelectedBidDetail(null);
        setSupplierProfile(null);

        // Connect to SSE stream — SSE sends the full auction state immediately on connect,
        // then again on every change. This is the ONLY way to get RTDB data.
        const sse = new EventSource(BiddingAPI.getStreamUrl(selectedJobId));
        eventSourceRef.current = sse;

        sse.onmessage = (event) => {
            try {
                const auctionState = JSON.parse(event.data);
                console.log('[SSE] Auction state received for', selectedJobId, ':', JSON.stringify(auctionState, null, 2));

                // Mark auction as active since we're receiving SSE events
                setAuctionJobs(prev => new Set(prev).add(selectedJobId));

                // SSE sends: { id, bids: { key: { amount, itemId, supplierId, timestamp } }, status, ... }
                const bidsObj = auctionState?.bids;
                if (bidsObj && typeof bidsObj === 'object' && Object.keys(bidsObj).length > 0) {
                    const parsed = parseAuctionBids(bidsObj, selectedJobId);
                    setRtdbBids(parsed);
                } else {
                    // Auction state arrived but no bids yet
                    setRtdbBids([]);
                }

                // Stop loading once first SSE message arrives
                setBidsLoading(false);
            } catch (err) {
                console.error("Error parsing SSE data:", err, 'Raw:', event.data);
            }
        };

        sse.onerror = () => {
            console.error("SSE connection error for job", selectedJobId);
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [selectedJobId]);

    // Fetch supplier details for all unique supplier IDs across bids
    useEffect(() => {
        const allSupplierIds = new Set<string>();
        [...existingBids, ...rtdbBids].forEach(b => {
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
    }, [existingBids, rtdbBids]);

    // Fetch item details for all unique item IDs across bids
    useEffect(() => {
        const allItemIds = new Set<string>();
        [...existingBids, ...rtdbBids].forEach(b => {
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
    }, [existingBids, rtdbBids]);

    // Fetch supplier profile when a bid is selected for detail view
    const handleViewBidDetail = async (bid: any) => {
        setSelectedBidDetail(bid);
        setSupplierProfile(null);
        const supplierId = bid.supplier_id || bid.supplierId;
        if (supplierId) {
            setProfileLoading(true);
            try {
                const { data } = await ProfilesAPI.getProfileByUserId(supplierId);
                setSupplierProfile(Array.isArray(data) ? data[0] : data);
            } catch {
                setSupplierProfile(null);
            } finally {
                setProfileLoading(false);
            }
        }
    };

    // Confirm bid → accept bid + create rental
    const handleConfirmBid = async (bid: any) => {
        const bidId = bid.bid_id;
        const supplierId = bid.supplier_id || bid.supplierId;
        if (!bidId || !selectedJobId) return;

        setConfirmingBidId(bidId);
        try {
            // 1. Accept the bid
            await BidsAPI.updateBidStatus(selectedJobId, bidId, 'accepted');

            // 2. Create a rental from the accepted bid
            const selectedJob = jobs.find(j => j.job_id === selectedJobId);

            await RentalsAPI.createRental({
                job_id: selectedJobId,
                contractor_id: user?.user_id || '',
                supplier_id: supplierId || '',
                bid_id: bidId,
                start_date: selectedJob?.required_from || new Date().toISOString(),
                end_date: selectedJob?.required_to || new Date().toISOString(),
                total_amount: Number(bid.amount || bid.bid_value || 0),
                status: 'active',
                payment_status: 'pending',
            });

            // 3. Update local state
            setExistingBids(prev => prev.map(b =>
                b.bid_id === bidId ? { ...b, status: 'accepted' } : { ...b, status: b.bid_id !== bidId && b.status === 'pending' ? 'rejected' : b.status }
            ));
            setStats(prev => ({ ...prev, awardedJobs: prev.awardedJobs + 1 }));

            setConfirmModal({
                success: true,
                message: `Bid confirmed! Rental created successfully for supplier ${supplierId?.split('-')[0] || 'Unknown'}.`
            });
        } catch (err: any) {
            console.error('Failed to confirm bid:', err);
            setConfirmModal({
                success: false,
                message: err.response?.data?.message || 'Failed to confirm bid. Please try again.'
            });
        } finally {
            setConfirmingBidId(null);
        }
    };

    const handleStartAuction = async (job: any) => {
        setStartingAuctionId(job.job_id);
        try {
            await BiddingAPI.createJobAuction({
                jobId: job.job_id,
                jobDetails: {
                    description: job.job_description,
                    latitude: job.latitude,
                    longitude: job.longitude,
                },
                startTime: Date.now(),
                endTime: Math.max(job.required_to ? new Date(job.required_to).getTime() : 0, Date.now() + 7 * 86400000),
                startingPrice: 0,
            });
            setAuctionJobs(prev => new Set(prev).add(job.job_id));
        } catch (err: any) {
            if (err.response?.status === 409) {
                setAuctionJobs(prev => new Set(prev).add(job.job_id));
            } else {
                console.error('Failed to start auction:', err);
                alert(err.response?.data?.message || 'Failed to start live bidding. Please try again.');
            }
        } finally {
            setStartingAuctionId(null);
        }
    };

    // Combine existing bids + RTDB bids (dedup by bid_id)
    const allBids = (() => {
        const seen = new Set<string>();
        const merged: any[] = [];

        existingBids.forEach(b => {
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
                _isLive: true,
            });
        });

        return merged;
    })();

    const selectedJob = jobs.find(j => j.job_id === selectedJobId);

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
            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setConfirmModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface border border-subtle rounded-2xl p-8 max-w-md w-full shadow-theme-lg text-center"
                        >
                            {confirmModal.success ? (
                                <CheckCircle2 className="w-16 h-16 text-accent-success mx-auto mb-4" />
                            ) : (
                                <AlertTriangle className="w-16 h-16 text-accent-danger mx-auto mb-4" />
                            )}
                            <h3 className="text-xl font-bold mb-2">{confirmModal.success ? 'Bid Confirmed!' : 'Confirmation Failed'}</h3>
                            <p className="text-muted mb-6">{confirmModal.message}</p>
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all"
                            >
                                {confirmModal.success ? 'Great!' : 'Close'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Contractor Dashboard</h1>
                    <p className="text-muted">Manage your equipment requests, review bids, and confirm rentals.</p>
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
                    { icon: DollarSign, label: 'Total Spent', value: `$${(stats.totalSpent / 1000).toFixed(1)}k`, trend: 'Lifetime volume', color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Active Requests Column (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Your Requests</h2>
                        <Link href="/contractor/requests" className="text-sm font-medium text-primary hover:underline">View All</Link>
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                        {jobs.length === 0 ? (
                            <div className="p-6 rounded-xl bg-surface border border-dashed border-subtle text-center text-muted">
                                <Briefcase className="w-8 h-8 opacity-50 mx-auto mb-2" />
                                <p>You haven&apos;t posted any equipment requests yet.</p>
                            </div>
                        ) : jobs.slice(0, 8).map((req) => {
                            const daysLeft = Math.max(0, Math.ceil((new Date(req.required_from).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                            const isSelected = selectedJobId === req.job_id;
                            return (
                                <div
                                    key={req.job_id}
                                    onClick={() => req.status === 'open' && setSelectedJobId(isSelected ? null : req.job_id)}
                                    className={`p-4 rounded-xl transition-all shadow-theme-sm group relative overflow-hidden ${req.status !== 'open'
                                        ? 'bg-surface border border-subtle opacity-70 cursor-not-allowed'
                                        : isSelected
                                            ? 'bg-primary/10 border border-primary cursor-pointer shadow-[0_0_20px_var(--color-primary-glow)]'
                                            : 'bg-surface border border-subtle hover:border-primary/50 cursor-pointer'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <span className="text-xs font-mono text-muted">{req.job_id.split('-')[0]}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${req.status === 'open' ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-muted'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-main mb-2 leading-snug relative z-10 line-clamp-2">{req.job_description}</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted mb-2">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {daysLeft > 0 ? `Needs in ${daysLeft}d` : 'Immediate'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {req.latitude?.toFixed(2)}, {req.longitude?.toFixed(2)}
                                        </span>
                                    </div>

                                    {isSelected && (
                                        <div className="mt-1 pt-2 border-t border-primary/20 text-xs text-primary font-bold flex items-center gap-1">
                                            <Radio className="w-3 h-3 animate-pulse" /> Monitoring &middot; {allBids.length} bid{allBids.length !== 1 ? 's' : ''}
                                        </div>
                                    )}

                                    {/* Start Bidding / Active status */}
                                    {req.status === 'open' && !auctionJobs.has(req.job_id) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStartAuction(req); }}
                                            disabled={startingAuctionId === req.job_id}
                                            className="mt-3 w-full py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-primary/20 hover:border-primary disabled:opacity-50"
                                        >
                                            {startingAuctionId === req.job_id
                                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...</>
                                                : <><Zap className="w-3.5 h-3.5" /> Start Live Bidding</>
                                            }
                                        </button>
                                    )}
                                    {req.status === 'open' && auctionJobs.has(req.job_id) && (
                                        <div className="mt-3 w-full py-2 text-center text-accent-success text-xs font-bold flex items-center justify-center gap-1.5">
                                            <Gavel className="w-3.5 h-3.5" /> Live Bidding Active
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bids & Details Column (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Selected Job Details */}
                    {selectedJob && (
                        <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-main mb-1">{selectedJob.job_description}</h3>
                                    <p className="text-xs font-mono text-muted">Job ID: {selectedJob.job_id}</p>
                                </div>
                                <span className="text-[10px] font-bold px-3 py-1 rounded-lg bg-accent-success/10 text-accent-success border border-accent-success/20 uppercase">{selectedJob.status}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-muted">Required From</p>
                                    <p className="font-bold text-main">{selectedJob.required_from ? new Date(selectedJob.required_from).toLocaleDateString() : 'TBD'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Required To</p>
                                    <p className="font-bold text-main">{selectedJob.required_to ? new Date(selectedJob.required_to).toLocaleDateString() : 'TBD'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Location</p>
                                    <p className="font-bold text-main">{selectedJob.latitude?.toFixed(4)}, {selectedJob.longitude?.toFixed(4)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Total Bids</p>
                                    <p className="font-bold text-primary">{allBids.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Bids to Review
                            {selectedJobId && rtdbBids.length > 0 && <span className="bg-accent-success/20 text-accent-success text-xs px-2 py-0.5 rounded animate-pulse">Live</span>}
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

                    <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden flex flex-col relative" style={{ minHeight: selectedBidDetail ? '480px' : '420px' }}>
                        {viewMode === 'list' ? (
                            <div className="flex-1 flex flex-col">
                                {!selectedJobId ? (
                                    <div className="flex-1 flex items-center justify-center p-8 text-center bg-base/50" style={{ minHeight: '420px' }}>
                                        <div>
                                            <Clock className="w-12 h-12 text-primary/50 mx-auto mb-4 animate-pulse" />
                                            <h3 className="text-lg font-bold mb-2">Select a Request</h3>
                                            <p className="text-muted max-w-sm mx-auto">Select an active job from the left to view incoming bids, supplier details, and confirm equipment rentals.</p>
                                        </div>
                                    </div>
                                ) : bidsLoading ? (
                                    <div className="flex-1 flex items-center justify-center p-8" style={{ minHeight: '420px' }}>
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                ) : allBids.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted bg-base/50" style={{ minHeight: '420px' }}>
                                        <Activity className="w-12 h-12 text-primary opacity-50 mx-auto mb-4 animate-bounce" />
                                        <p className="font-bold text-main mb-1">
                                            {auctionJobs.has(selectedJobId!) ? 'Waiting for Bids...' : 'Live Bidding Not Started'}
                                        </p>
                                        <p className="text-sm max-w-sm">
                                            {auctionJobs.has(selectedJobId!)
                                                ? 'The auction is active. Bids from suppliers will appear here in real-time as they come in.'
                                                : 'Click "Start Live Bidding" on the job card to register this job in the bidding service and allow suppliers to submit real-time bids.'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-y-auto flex-1 relative">
                                        <table className="w-full text-left border-collapse relative z-10">
                                            <thead className="sticky top-0 bg-surface border-b border-subtle z-20 shadow-sm">
                                                <tr className="text-[11px] uppercase tracking-wider text-muted font-semibold bg-surface-hover/50">
                                                    <th className="p-3">Supplier</th>
                                                    <th className="p-3">Amount</th>
                                                    <th className="p-3">Items</th>
                                                    <th className="p-3">Status</th>
                                                    <th className="p-3">Date</th>
                                                    <th className="p-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-subtle">
                                                <AnimatePresence>
                                                    {allBids.map((bid, i) => {
                                                        const supplierId = bid.supplier_id || bid.supplierId;
                                                        const isAccepted = bid.status === 'accepted';
                                                        const isRejected = bid.status === 'rejected';
                                                        const isPending = bid.status === 'pending';
                                                        const isLive = (bid as any)._isLive;

                                                        return (
                                                            <motion.tr
                                                                key={bid.bid_id || i}
                                                                initial={isLive ? { opacity: 0, x: -20, backgroundColor: 'var(--color-primary-glow)' } : { opacity: 1, x: 0 }}
                                                                animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                                                                transition={{ duration: 0.5 }}
                                                                className={`hover:bg-surface-hover/30 transition-colors cursor-pointer ${
                                                                    selectedBidDetail?.bid_id === bid.bid_id ? 'bg-primary/5' : ''
                                                                }`}
                                                                onClick={() => handleViewBidDetail(bid)}
                                                            >
                                                                <td className="p-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                                            <User className="w-4 h-4 text-primary" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="font-bold text-main text-sm truncate max-w-[120px]" title={supplierId}>{bid.supplier?.company_name || bid.supplier?.name || supplierId?.split('-')[0] || 'Unknown'}</p>
                                                                            {isLive && <span className="text-[10px] text-accent-success font-bold">LIVE</span>}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className="font-black text-lg font-mono text-main">${Number(bid.amount || 0).toFixed(0)}</span>
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className="text-xs text-muted">
                                                                        {bid.item?.name || bid.item_id?.split('-')[0] || (bid.items?.length ? `${bid.items.length} item${bid.items.length !== 1 ? 's' : ''}` : '—')}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                                        isAccepted ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                                                        : isRejected ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                                    }`}>
                                                                        {bid.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 text-xs text-muted">
                                                                    {bid.created_at ? new Date(bid.created_at).toLocaleDateString() : bid.receivedAt || '—'}
                                                                </td>
                                                                <td className="p-3 text-right">
                                                                    {isPending && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleConfirmBid(bid); }}
                                                                            disabled={confirmingBidId === bid.bid_id}
                                                                            className="px-3 py-1.5 bg-accent-success/10 hover:bg-accent-success font-bold hover:text-white text-accent-success rounded-lg transition-all text-xs border border-accent-success/20 hover:border-accent-success active:scale-95 flex items-center gap-1 ml-auto disabled:opacity-50"
                                                                        >
                                                                            {confirmingBidId === bid.bid_id
                                                                                ? <><Loader2 className="w-3 h-3 animate-spin" /> Confirming...</>
                                                                                : <><Check className="w-3 h-3" /> Confirm Bid</>
                                                                            }
                                                                        </button>
                                                                    )}
                                                                    {isAccepted && (
                                                                        <span className="text-xs text-accent-success font-bold flex items-center gap-1 justify-end">
                                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Rental Created
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 w-full bg-base/50 relative overflow-hidden rounded-b-2xl p-1" style={{ minHeight: '420px' }}>
                                <MapView
                                    interactive={true}
                                    zoom={12}
                                    center={{ lat: 37.7749, lng: -122.4194 }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Bid + Supplier Detail Panel */}
                    <AnimatePresence>
                        {selectedBidDetail && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden"
                            >
                                {/* Panel Header */}
                                <div className="p-4 border-b border-subtle bg-surface-hover/30 flex justify-between items-center">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" /> Bid & Supplier Details
                                    </h3>
                                    <button onClick={() => { setSelectedBidDetail(null); setSupplierProfile(null); }} className="p-1 hover:bg-surface-hover rounded-lg transition-colors">
                                        <X className="w-4 h-4 text-muted" />
                                    </button>
                                </div>

                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Bid Details */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs uppercase tracking-wider text-muted font-bold flex items-center gap-2">
                                            <Gavel className="w-3.5 h-3.5" /> Bid Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                <span className="text-sm text-muted">Bid ID</span>
                                                <span className="text-sm font-mono font-bold text-main">{selectedBidDetail.bid_id?.split('-')[0] || '—'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                <span className="text-sm text-muted">Amount</span>
                                                <span className="text-2xl font-black font-mono text-primary">${Number(selectedBidDetail.amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                <span className="text-sm text-muted">Status</span>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                                                    selectedBidDetail.status === 'accepted' ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                                    : selectedBidDetail.status === 'rejected' ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                                                    : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                }`}>{selectedBidDetail.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                <span className="text-sm text-muted">Submitted</span>
                                                <span className="text-sm font-medium text-main">
                                                    {selectedBidDetail.created_at ? new Date(selectedBidDetail.created_at).toLocaleString() : selectedBidDetail.receivedAt || '—'}
                                                </span>
                                            </div>
                                            {selectedBidDetail.items && selectedBidDetail.items.length > 0 && (
                                                <div className="py-2">
                                                    <span className="text-sm text-muted mb-2 block">Equipment Items</span>
                                                    {selectedBidDetail.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 text-sm bg-base rounded-lg p-2 mb-1">
                                                            <Package className="w-4 h-4 text-muted" />
                                                            <span className="font-mono text-main">{(item.item_id || item.itemId)?.split('-')[0] || 'Item'}</span>
                                                            <span className="text-muted">× {item.quantity || 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm Button in Detail Panel */}
                                        {selectedBidDetail.status === 'pending' && (
                                            <button
                                                onClick={() => handleConfirmBid(selectedBidDetail)}
                                                disabled={confirmingBidId === selectedBidDetail.bid_id}
                                                className="w-full py-3 bg-accent-success hover:bg-accent-success/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-theme-sm"
                                            >
                                                {confirmingBidId === selectedBidDetail.bid_id
                                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming & Creating Rental...</>
                                                    : <><Check className="w-4 h-4" /> Confirm Bid & Create Rental</>
                                                }
                                            </button>
                                        )}
                                        {selectedBidDetail.status === 'accepted' && (
                                            <div className="w-full py-3 bg-accent-success/10 text-accent-success rounded-xl font-bold text-center flex items-center justify-center gap-2 border border-accent-success/20">
                                                <CheckCircle2 className="w-4 h-4" /> Bid Confirmed — Rental Active
                                            </div>
                                        )}
                                    </div>

                                    {/* Supplier Profile */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs uppercase tracking-wider text-muted font-bold flex items-center gap-2">
                                            <User className="w-3.5 h-3.5" /> Supplier Information
                                        </h4>
                                        {profileLoading ? (
                                            <div className="flex items-center justify-center p-8">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            </div>
                                        ) : supplierProfile ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-base rounded-xl">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-main">{supplierProfile.company_name || 'Unnamed Supplier'}</p>
                                                        <p className="text-xs text-muted">{supplierProfile.profile_type || 'Supplier'}</p>
                                                    </div>
                                                    {supplierProfile.verification_status === 'verified' && (
                                                        <span className="ml-auto" aria-label="Verified"><ShieldCheck className="w-5 h-5 text-accent-success" /></span>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                    <span className="text-sm text-muted">Supplier ID</span>
                                                    <span className="text-xs font-mono text-main">{(selectedBidDetail.supplier_id || selectedBidDetail.supplierId)?.split('-')[0]}</span>
                                                </div>
                                                {supplierProfile.company_name && (
                                                    <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                        <span className="text-sm text-muted">Company</span>
                                                        <span className="text-sm font-bold text-main">{supplierProfile.company_name}</span>
                                                    </div>
                                                )}
                                                {supplierProfile.phone_number && (
                                                    <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                        <span className="text-sm text-muted">Phone</span>
                                                        <span className="text-sm text-main">{supplierProfile.phone_number}</span>
                                                    </div>
                                                )}
                                                {supplierProfile.address && (
                                                    <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                        <span className="text-sm text-muted">Address</span>
                                                        <span className="text-sm text-main truncate max-w-[180px]" title={supplierProfile.address}>{supplierProfile.address}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center py-2 border-b border-subtle">
                                                    <span className="text-sm text-muted">Verification</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                                        supplierProfile.verification_status === 'verified'
                                                            ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                    }`}>{supplierProfile.verification_status || 'Unknown'}</span>
                                                </div>
                                                {supplierProfile.created_at && (
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-sm text-muted">Member Since</span>
                                                        <span className="text-sm text-main">{new Date(supplierProfile.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center text-muted bg-base rounded-xl">
                                                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">Supplier profile details not available.</p>
                                                <p className="text-xs mt-1">ID: {(selectedBidDetail.supplier_id || selectedBidDetail.supplierId) || '—'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
