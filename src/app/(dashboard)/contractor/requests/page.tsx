'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Search, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { JobsAPI } from '@/lib/api/jobs.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ContractorRequestsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user?.user_id) return;
            setIsLoading(true);
            try {
                const { data } = await JobsAPI.getContractorJobs();
                const sorted = (Array.isArray(data) ? data : []).sort(
                    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setJobs(sorted);
            } catch (err: any) {
                console.error('Failed to load requests:', err);
                setError(err.response?.data?.message || 'Failed to load your requests.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, [user?.user_id]);

    const filtered = jobs
        .filter(j => statusFilter === 'all' || j.status === statusFilter)
        .filter(j =>
            j.job_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.job_id?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    if (isLoading) return <LoadingWindow fullScreen message="Loading your requests..." />;

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-primary" /> My Requests
                    </h1>
                    <p className="text-muted">View and manage all your equipment requests.</p>
                </div>
                <Link
                    href="/contractor/requests/new"
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-theme-lg transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> New Request
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by description or job ID..."
                        className="w-full bg-surface border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:border-primary transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'open', 'in_progress', 'completed', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors border ${
                                statusFilter === s
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface text-muted border-subtle hover:text-main'
                            }`}
                        >
                            {s === 'in_progress' ? 'In Progress' : s}
                        </button>
                    ))}
                </div>
            </div>

            {error && <ErrorWindow message={error} />}

            {filtered.length === 0 ? (
                <EmptyState
                    title="No Requests Found"
                    message="You haven't created any equipment requests yet, or none match your filter."
                    icon={<Briefcase className="w-12 h-12 opacity-50" />}
                />
            ) : (
                <div className="space-y-3">
                    {filtered.map((job, i) => {
                        const statusColor =
                            job.status === 'open'
                                ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                : job.status === 'in_progress'
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : job.status === 'completed'
                                        ? 'bg-surface-hover text-muted border-subtle'
                                        : 'bg-accent-danger/10 text-accent-danger border-accent-danger/20';

                        return (
                            <motion.div
                                key={job.job_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm hover:shadow-theme-md transition-all"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="font-bold text-main">{job.job_description}</p>
                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${statusColor}`}>
                                                {job.status === 'in_progress' ? 'In Progress' : job.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {job.required_from
                                                    ? new Date(job.required_from).toLocaleDateString()
                                                    : 'TBD'}{' '}
                                                —{' '}
                                                {job.required_to
                                                    ? new Date(job.required_to).toLocaleDateString()
                                                    : 'TBD'}
                                            </span>
                                            {job.latitude && job.longitude && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {Number(job.latitude).toFixed(4)}, {Number(job.longitude).toFixed(4)}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/contractor/requests/${job.job_id}`}
                                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
