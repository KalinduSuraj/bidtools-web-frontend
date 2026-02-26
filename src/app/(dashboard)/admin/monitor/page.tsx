'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, Clock, MapPin, Search, ShieldCheck, AlertTriangle, Loader2, DollarSign, Radio, Wifi, WifiOff, Gavel, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobsAPI } from '@/lib/api/jobs.api';
import { BidsAPI } from '@/lib/api/bids.api';
import { BiddingAPI } from '@/lib/api/bidding.api';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { ItemsAPI } from '@/lib/api/items.api';
import { EmptyState } from '@/components/ui/EmptyState';

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

export default function AdminBiddingMonitor() {
    const [allJobs, setAllJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedJobBids, setSelectedJobBids] = useState<any[]>([]);
    const [bidsLoading, setBidsLoading] = useState(false);
    const [rtdbBids, setRtdbBids] = useState<any[]>([]);
    const [sseConnected, setSseConnected] = useState(false);
    const [jobSearch, setJobSearch] = useState('');
    const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');
    const [supplierProfiles, setSupplierProfiles] = useState<Record<string, any>>({});
    const [itemDetails, setItemDetails] = useState<Record<string, any>>({});
    const eventSourceRef = useRef<EventSource | null>(null);

    // Fetch all jobs
    useEffect(() => {
        const fetchJobs = async () => {
            setJobsLoading(true);
            try {
                const { data } = await JobsAPI.getNearbyJobs({ latitude: 0, longitude: 0, radiusKm: 999999 });
                setAllJobs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // When a job is selected, fetch existing bids and connect SSE
    useEffect(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setSseConnected(false);
        }
        setRtdbBids([]);
        setSelectedJobBids([]);

        if (!selectedJobId) return;

        // Fetch existing bids
        const fetchBids = async () => {
            setBidsLoading(true);
            try {
                const { data } = await BidsAPI.getBidsForJob(selectedJobId);
                setSelectedJobBids(Array.isArray(data) ? data : []);
            } catch {
                setSelectedJobBids([]);
            } finally {
                setBidsLoading(false);
            }
        };
        fetchBids();

        // Connect SSE
        const sse = new EventSource(BiddingAPI.getStreamUrl(selectedJobId));
        eventSourceRef.current = sse;
        sse.onopen = () => setSseConnected(true);
        sse.onmessage = (event) => {
            try {
                const auctionState = JSON.parse(event.data);
                if (auctionState && typeof auctionState === 'object') {
                    const parsed = parseAuctionBids(auctionState.bids || {}, selectedJobId);
                    setRtdbBids(parsed);
                }
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        };
        sse.onerror = () => setSseConnected(false);

        return () => {
            sse.close();
            eventSourceRef.current = null;
        };
    }, [selectedJobId]);

    // Filtered jobs
    const filteredJobs = allJobs.filter(job => {
        const matchSearch = jobSearch === '' ||
            job.job_description?.toLowerCase().includes(jobSearch.toLowerCase()) ||
            job.job_id?.toLowerCase().includes(jobSearch.toLowerCase());
        const matchStatus = jobStatusFilter === 'all' || job.status === jobStatusFilter;
        return matchSearch && matchStatus;
    });

    // Fetch supplier profiles for RTDB bids
    useEffect(() => {
        const ids = rtdbBids.map(b => b.supplier_id).filter(Boolean);
        const unique = [...new Set(ids)].filter(id => !supplierProfiles[id]);
        if (unique.length === 0) return;
        unique.forEach(async (sid) => {
            try {
                const { data } = await ProfilesAPI.getSupplierProfile(sid);
                if (data) setSupplierProfiles(prev => ({ ...prev, [sid]: data }));
            } catch { /* ignore */ }
        });
    }, [rtdbBids]);

    // Fetch item details for RTDB bids
    useEffect(() => {
        const ids = rtdbBids.map(b => b.item_id).filter(Boolean);
        const unique = [...new Set(ids)].filter(id => !itemDetails[id]);
        if (unique.length === 0) return;
        unique.forEach(async (iid) => {
            try {
                const { data } = await ItemsAPI.getItemById(iid);
                if (data) setItemDetails(prev => ({ ...prev, [iid]: data }));
            } catch { /* ignore */ }
        });
    }, [rtdbBids]);

    const selectedJob = allJobs.find(j => j.job_id === selectedJobId);

    if (jobsLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p>Initializing global market feed...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <Gavel className="w-8 h-8 text-primary" /> Live Bidding Monitor
                    </h1>
                    <p className="text-muted">Select any job to view details, existing bids, and live SSE bid stream.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${
                        sseConnected
                            ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                            : 'bg-surface-hover text-muted border-subtle'
                    }`}>
                        {sseConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        {sseConnected ? 'Stream Active' : selectedJobId ? 'Connecting...' : 'No Stream'}
                    </div>
                    <div className="px-4 py-2 bg-surface border border-subtle rounded-xl text-sm text-muted font-mono">
                        {allJobs.length} total &middot; {allJobs.filter(j => j.status === 'open').length} open
                    </div>
                </div>
            </div>

            {/* Main 5-col Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">

                {/* Left: Jobs List (2 cols) */}
                <div className="lg:col-span-2 bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden">
                    {/* Search & Filters */}
                    <div className="p-4 border-b border-subtle bg-surface-hover/30 space-y-3 shrink-0">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={jobSearch}
                                onChange={(e) => setJobSearch(e.target.value)}
                                placeholder="Search jobs by description or ID..."
                                className="w-full bg-base border border-subtle text-main rounded-lg py-2 pl-9 pr-3 focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {['all', 'open', 'in_progress', 'completed', 'cancelled'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setJobStatusFilter(s)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors border ${
                                        jobStatusFilter === s
                                            ? 'bg-primary/10 text-primary border-primary/20'
                                            : 'bg-base text-muted border-subtle hover:border-primary/30'
                                    }`}
                                >
                                    {s === 'all' ? 'All' : s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-muted flex justify-between">
                            <span>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Job Cards */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {filteredJobs.length === 0 ? (
                            <div className="p-8">
                                <EmptyState title="No Jobs Found" message="No jobs match the current filters." icon={<Briefcase className="w-10 h-10 opacity-30" />} />
                            </div>
                        ) : (
                            filteredJobs.map((job) => {
                                const isSelected = selectedJobId === job.job_id;
                                const statusColors: Record<string, string> = {
                                    open: 'bg-accent-success/10 text-accent-success',
                                    in_progress: 'bg-primary/10 text-primary',
                                    completed: 'bg-surface-hover text-muted',
                                    cancelled: 'bg-accent-danger/10 text-accent-danger',
                                };
                                return (
                                    <div
                                        key={job.job_id}
                                        onClick={() => setSelectedJobId(isSelected ? null : job.job_id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-primary bg-primary/5 shadow-[0_0_20px_var(--color-primary-glow)]'
                                                : 'border-subtle bg-base hover:border-primary/40 hover:bg-surface-hover/30'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-mono font-bold text-muted bg-surface-hover px-1.5 py-0.5 rounded">{job.job_id.split('-')[0]}</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${statusColors[job.status] || 'bg-surface-hover text-muted'}`}>
                                                {job.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-main text-sm mb-2 line-clamp-2">{job.job_description}</h4>
                                        <div className="flex items-center justify-between text-xs text-muted">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {job.required_from ? new Date(job.required_from).toLocaleDateString() : 'TBD'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.latitude?.toFixed(2)}, {job.longitude?.toFixed(2)}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="mt-2 pt-2 border-t border-primary/20 text-xs text-primary font-bold flex items-center gap-1">
                                                <Radio className="w-3 h-3 animate-pulse" /> Monitoring
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Job Details + Bids + Live Stream (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
                    {!selectedJobId ? (
                        <div className="flex-1 bg-surface border border-subtle rounded-2xl shadow-theme-sm flex items-center justify-center">
                            <div className="text-center p-12 text-muted">
                                <Gavel className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-bold text-main mb-2">Select a Job</h3>
                                <p className="text-sm max-w-md">Choose any job from the list to view its full details, all received bids, and connect to its live SSE bidding stream.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Job Details Card */}
                            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm shrink-0">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-main mb-1">{selectedJob?.job_description}</h3>
                                        <p className="text-xs font-mono text-muted">Job ID: {selectedJob?.job_id}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                                        selectedJob?.status === 'open' ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                        : selectedJob?.status === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20'
                                        : 'bg-surface-hover text-muted border-subtle'
                                    }`}>
                                        {selectedJob?.status?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Contractor</p>
                                        <p className="font-bold font-mono text-main">{selectedJob?.contractor_id?.split('-')[0]}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Required From</p>
                                        <p className="font-bold text-main">{selectedJob?.required_from ? new Date(selectedJob.required_from).toLocaleDateString() : 'TBD'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Required To</p>
                                        <p className="font-bold text-main">{selectedJob?.required_to ? new Date(selectedJob.required_to).toLocaleDateString() : 'TBD'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Location</p>
                                        <p className="font-bold text-main">{selectedJob?.latitude?.toFixed(4)}, {selectedJob?.longitude?.toFixed(4)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Existing Bids */}
                            <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden shrink-0">
                                <div className="p-4 border-b border-subtle bg-surface-hover/30 flex justify-between items-center">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" /> Existing Bids ({selectedJobBids.length})
                                    </h3>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto">
                                    {bidsLoading ? (
                                        <div className="p-6 text-center text-muted">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
                                            <p className="text-xs">Loading bids...</p>
                                        </div>
                                    ) : selectedJobBids.length === 0 ? (
                                        <div className="p-6 text-center text-muted text-sm">No existing bids found for this job.</div>
                                    ) : (
                                        <table className="w-full text-left text-sm">
                                            <thead className="sticky top-0 bg-surface border-b border-subtle">
                                                <tr className="text-[10px] uppercase tracking-wider text-muted">
                                                    <th className="p-3 font-medium">Supplier</th>
                                                    <th className="p-3 font-medium">Amount</th>
                                                    <th className="p-3 font-medium">Status</th>
                                                    <th className="p-3 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-subtle">
                                                {selectedJobBids.map((bid, i) => (
                                                    <tr key={bid.bid_id || i} className="hover:bg-surface-hover/30 transition-colors">
                                                        <td className="p-3 font-mono font-bold text-main">{bid.supplier_id?.split('-')[0] || bid.supplier?.name || 'Unknown'}</td>
                                                        <td className="p-3 font-bold text-primary">${Number(bid.amount || 0).toFixed(2)}</td>
                                                        <td className="p-3">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                                bid.status === 'accepted' ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                                                : bid.status === 'rejected' ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                                                                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                            }`}>{bid.status || 'pending'}</span>
                                                        </td>
                                                        <td className="p-3 text-xs text-muted">{bid.created_at ? new Date(bid.created_at).toLocaleString() : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Live SSE Stream */}
                            <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden flex-1 min-h-[200px]">
                                <div className="p-4 border-b border-subtle bg-surface-hover/30 flex justify-between items-center">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <Radio className={`w-4 h-4 ${sseConnected ? 'text-accent-success animate-pulse' : 'text-muted'}`} />
                                        Live Bid Stream
                                    </h3>
                                    <span className="text-xs text-muted font-mono">{rtdbBids.length} live bid{rtdbBids.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    {rtdbBids.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center text-center p-8 text-muted h-full">
                                            <Activity className={`w-10 h-10 mx-auto mb-3 ${sseConnected ? 'text-primary opacity-50 animate-bounce' : 'opacity-20'}`} />
                                            <p className="font-bold text-main text-sm mb-1">{sseConnected ? 'Listening...' : 'Connecting...'}</p>
                                            <p className="text-xs">Real-time bids from the bidding service will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-subtle">
                                            <AnimatePresence>
                                                {rtdbBids.map((bid, i) => {
                                                    const supplierName = supplierProfiles[bid.supplier_id]?.company_name || supplierProfiles[bid.supplier_id]?.full_name || bid.supplier_id?.split('-')[0] || 'Unknown';
                                                    const itemName = itemDetails[bid.item_id]?.name || bid.item_id?.split('-')[0] || '';
                                                    return (
                                                    <motion.div
                                                        key={bid.bid_id || `live-${i}`}
                                                        initial={{ opacity: 0, x: -10, backgroundColor: 'var(--color-primary-glow)' }}
                                                        animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                                                        transition={{ duration: 0.4 }}
                                                        className="px-4 py-3 hover:bg-surface-hover/30 transition-colors flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-lg font-black font-mono text-main">${Number(bid.amount).toFixed(2)}</span>
                                                            <div>
                                                                <p className="text-xs text-muted">Supplier: <span className="font-bold text-main">{supplierName}</span></p>
                                                                {bid.item_id && <p className="text-[10px] text-muted">Item: {itemName}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-mono text-muted">{bid.created_at ? new Date(bid.created_at).toLocaleTimeString() : '—'}</span>
                                                            <div className="mt-1">
                                                                {bid.amount < 100 ? (
                                                                    <span className="inline-flex items-center gap-1 text-accent-danger text-[10px] font-bold">
                                                                        <AlertTriangle className="w-3 h-3" /> Low
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-accent-success text-[10px] font-bold">
                                                                        <ShieldCheck className="w-3 h-3" /> OK
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
