'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, Clock, FileText, Search, Filter, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api/client';

export default function AdminBiddingMonitor() {
    const [selectedAuction, setSelectedAuction] = useState<string | null>(null);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [liveBids, setLiveBids] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Fetch active global auctions (using nearby with massive radius as workaround for global feed)
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const { data } = await apiClient.get('/jobs/nearby', {
                    params: { latitude: '0', longitude: '0', radiusKm: '999999' }
                });
                setAuctions(Array.isArray(data) ? data.filter((j: any) => j.status === 'open') : []);
            } catch (error) {
                console.error('Failed to fetch global auctions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    // Connect to SSE stream when an auction is selected
    useEffect(() => {
        if (!selectedAuction) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            return;
        }

        // Clear previous bids for the new selected stream
        setLiveBids([]);

        // The base URL comes from Axios defaults, but EventSource needs a full string URL
        const baseURL = apiClient.defaults.baseURL || 'http://localhost:3002';

        // Connect to stream
        const sse = new EventSource(`${baseURL}/bid/stream/${selectedAuction}`);
        eventSourceRef.current = sse;

        sse.onmessage = (event) => {
            try {
                const newBid = JSON.parse(event.data);
                // Append bid to top of the list
                setLiveBids(prev => [{ ...newBid, receivedAt: new Date().toLocaleTimeString() }, ...prev]);
            } catch (err) {
                console.error("Error parsing SSE data:", err);
            }
        };

        sse.onerror = (err) => {
            console.error("SSE connection error:", err);
            // Optionally close or attempt reconnect
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [selectedAuction]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p>Initializing global market feed...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] w-full max-h-[1000px] animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" /> Live Bidding Monitor
                    </h1>
                    <p className="text-muted">Real-time oversight of all global platform auctions via SSE stream.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm">
                        <Filter className="w-4 h-4" /> Filtering
                    </button>
                    <div className="px-4 py-2 bg-accent-success/10 text-accent-success border border-accent-success/20 rounded-xl text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent-success animate-pulse" /> {eventSourceRef.current ? 'Stream Active' : 'Connected'}
                    </div>
                </div>
            </div>

            {/* Split Pane Interface */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* Left Pane: Active Auctions */}
                <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden relative">
                    <div className="p-4 border-b border-subtle bg-surface-hover/50 flex justify-between items-center relative z-10">
                        <h2 className="font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-muted" /> Active Global Auctions</h2>
                        <div className="relative w-48 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                            <input type="text" placeholder="Search ID..." className="w-full bg-base border border-subtle rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
                        {auctions.length === 0 ? (
                            <div className="text-center p-8 text-muted border-2 border-dashed border-subtle rounded-xl">
                                <p>No active global auctions found at this time.</p>
                            </div>
                        ) : auctions.map((auc) => (
                            <div
                                key={auc.job_id}
                                onClick={() => setSelectedAuction(auc.job_id === selectedAuction ? null : auc.job_id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAuction === auc.job_id
                                    ? 'border-primary bg-primary/10 shadow-[inner_0_0_10px_var(--color-primary-glow)]'
                                    : 'border-subtle hover:border-primary/50 bg-base'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-muted bg-surface-hover px-2 py-0.5 rounded">{auc.job_id.split('-')[0]}</span>
                                    </div>
                                    <span className="font-mono text-sm font-bold tracking-tight text-primary flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> Needed: {new Date(auc.required_from).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold mb-3">{auc.job_description}</h3>

                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="text-muted text-xs mb-0.5">Contractor</p>
                                        <p className="font-bold font-mono text-main">{auc.contractor_id.split('-')[0]}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-muted text-xs mb-0.5">Stream Status</p>
                                        <p className={`font-bold ${selectedAuction === auc.job_id ? 'text-accent-success animate-pulse' : 'text-muted'}`}>
                                            {selectedAuction === auc.job_id ? 'Monitoring' : 'Idle'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Pane: Live Bidding Stream */}
                <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-glow)] blur-[100px] opacity-10 pointer-events-none" />

                    <div className="p-4 border-b border-subtle bg-surface-hover/50 flex justify-between items-center relative z-10">
                        <h2 className="font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-muted" />
                            {selectedAuction ? `Incoming Stream: ${selectedAuction.split('-')[0]}` : 'Select an auction'}
                        </h2>
                        <span className="text-xs text-muted font-mono">{liveBids.length} records</span>
                    </div>

                    <div className="flex-1 overflow-x-auto min-h-0 relative z-10 flex flex-col">
                        {!selectedAuction ? (
                            <div className="flex-1 flex items-center justify-center text-center p-8 text-muted">
                                <div>
                                    <Activity className="w-12 h-12 opacity-30 mx-auto mb-4" />
                                    <p>Select an auction from the left to open an active SSE stream connection.</p>
                                </div>
                            </div>
                        ) : liveBids.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted">
                                <Activity className="w-12 h-12 text-primary opacity-50 mx-auto mb-4 animate-bounce" />
                                <p className="font-bold text-main mb-1">Listening for Bids...</p>
                                <p className="text-sm">Server-Sent Events connection established. Waiting for incoming data streams from the server.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-surface border-b border-subtle z-20 shadow-sm">
                                    <tr className="text-[11px] uppercase tracking-wider text-muted">
                                        <th className="p-4 font-medium">Time (Local)</th>
                                        <th className="p-4 font-medium">Bid ID</th>
                                        <th className="p-4 font-medium">Supplier</th>
                                        <th className="p-4 font-medium">Amount</th>
                                        <th className="p-4 font-medium text-right pr-6">System Risk</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-subtle font-mono text-sm leading-relaxed">
                                    <AnimatePresence>
                                        {liveBids.map((bid, i) => (
                                            <motion.tr
                                                key={bid.bid_id || i}
                                                initial={{ opacity: 0, x: -20, backgroundColor: 'var(--color-primary-glow)' }}
                                                animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                                                transition={{ duration: 0.5 }}
                                                className="hover:bg-surface-hover/30 transition-colors group cursor-default"
                                            >
                                                <td className="p-4 text-muted w-32">{bid.receivedAt}</td>
                                                <td className="p-4"><span className="text-primary font-bold">{bid.bid_id?.split('-')[0] || `B-${i}`}</span></td>
                                                <td className="p-4 text-main font-semibold truncate max-w-[120px]" title={bid.supplier_id}>{bid.supplier_id?.split('-')[0] || 'Unknown'}</td>
                                                <td className="p-4 font-bold text-lg text-main">${bid.amount}</td>
                                                <td className="p-4 text-right pr-6">
                                                    {bid.amount < 100 ? (
                                                        <span className="inline-flex items-center gap-1.5 text-accent-danger bg-accent-danger/10 px-2 py-0.5 rounded text-xs font-bold font-sans animate-pulse">
                                                            <AlertTriangle className="w-3.5 h-3.5" /> Suspicious Risk
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-accent-success bg-accent-success/10 px-2 py-0.5 rounded text-xs font-bold font-sans">
                                                            <ShieldCheck className="w-3.5 h-3.5" /> Normal
                                                        </span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
