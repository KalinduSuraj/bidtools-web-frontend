'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, CheckCircle2, XCircle, Clock, AlertTriangle, Eye, RefreshCw, Loader2, FileText } from 'lucide-react';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminVerificationsPage() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchProfiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await ProfilesAPI.getProfiles();
            setProfiles(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to load profiles:', err);
            setError(err.response?.data?.message || 'Failed to load verification requests.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleVerification = async (profileId: string, status: string) => {
        setProcessingId(profileId);
        try {
            await ProfilesAPI.updateVerificationStatus(profileId, status);
            await fetchProfiles();
        } catch (err: any) {
            console.error('Failed to update verification:', err);
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = profiles
        .filter(p => statusFilter === 'all' || p.verification_status === statusFilter)
        .filter(p =>
            p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.contact_number?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const pendingCount = profiles.filter(p => p.verification_status === 'pending').length;

    if (isLoading) return <LoadingWindow fullScreen message="Loading verification queue..." />;

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" /> Verification Center
                    </h1>
                    <p className="text-muted">
                        Review and verify business profiles.
                        {pendingCount > 0 && <span className="ml-2 text-orange-500 font-bold">({pendingCount} pending)</span>}
                    </p>
                </div>
                <button onClick={fetchProfiles} className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search company name or contact..."
                        className="w-full bg-surface border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:border-primary transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'verified', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors border ${statusFilter === s
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface text-muted border-subtle hover:text-main'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {error && <ErrorWindow message={error} />}

            {/* Profile Cards */}
            {filtered.length === 0 ? (
                <EmptyState
                    title="No Profiles Found"
                    message="No verification requests match your current filters."
                    icon={<FileText className="w-12 h-12 opacity-50" />}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {filtered.map((p) => (
                            <motion.div
                                key={p.profile_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-main">{p.company_name}</h3>
                                        <p className="text-sm text-muted">{p.contact_number}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${p.verification_status === 'verified'
                                        ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                        : p.verification_status === 'rejected'
                                            ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20'
                                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                        }`}>
                                        {p.verification_status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        {p.verification_status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                                        {p.verification_status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                        {p.verification_status}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    <p className="text-muted"><span className="font-medium text-main">Address:</span> {p.address}</p>
                                    <p className="text-muted"><span className="font-medium text-main">Submitted:</span> {new Date(p.created_at).toLocaleDateString()}</p>
                                    {p.documents_url && (
                                        <a href={p.documents_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 w-fit">
                                            <Eye className="w-3.5 h-3.5" /> View Documents
                                        </a>
                                    )}
                                </div>

                                {p.verification_status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-subtle">
                                        <button
                                            onClick={() => handleVerification(p.profile_id, 'verified')}
                                            disabled={processingId === p.profile_id}
                                            className="flex-1 py-2 bg-accent-success/10 hover:bg-accent-success/20 text-accent-success rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {processingId === p.profile_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                                        </button>
                                        <button
                                            onClick={() => handleVerification(p.profile_id, 'rejected')}
                                            disabled={processingId === p.profile_id}
                                            className="flex-1 py-2 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {processingId === p.profile_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
