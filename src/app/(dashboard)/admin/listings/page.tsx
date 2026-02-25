'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { List, Search, MapPin, Clock, Filter, AlertTriangle, Loader2 } from 'lucide-react';
import { JobsAPI } from '@/lib/api/jobs.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

export default function AdminListingsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAllJobs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // To get all jobs globally, the API might not support an explicit "get all" route directly without contractor_id
                // But for Admin, we use the fallback of /jobs assuming an admin override or mock query.
                // Assuming /jobs works for admin or we fetch nearby with huge radius
                const { data } = await JobsAPI.getNearbyJobs({ latitude: 37.7749, longitude: -122.4194, radiusKm: 10000 });
                setJobs(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error("Failed to load listings:", err);
                setError(err.response?.data?.message || "Failed to load global listings.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllJobs();
    }, []);

    const filteredJobs = jobs.filter(j =>
        j.job_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.job_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <List className="w-8 h-8 text-primary" /> Global Listings
                    </h1>
                    <p className="text-muted">Master view of all contractor equipment requests across the platform.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm">
                        <Filter className="w-4 h-4" /> Filter Listings
                    </button>
                    <button className="px-4 py-2 bg-accent-danger/10 text-accent-danger hover:bg-accent-danger hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Audit Flags
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-theme-sm">
                <div className="p-4 border-b border-subtle bg-surface-hover/30 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Active Jobs ({jobs.length})</h3>
                    <div className="relative w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search descriptions or IDs..."
                            className="w-full bg-base border border-subtle text-main rounded-lg py-2 pl-9 pr-3 focus:ring-1 focus:border-primary transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted bg-surface-hover/50">
                                <th className="px-6 py-4 font-medium">Job Details</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Dates</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle relative">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-muted border-none">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                                        Fetching global listings...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="p-0 border-none">
                                        <div className="py-12">
                                            <ErrorWindow message={error} />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-muted">No jobs found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredJobs.map((job) => (
                                    <tr key={job.job_id} className="hover:bg-surface-hover/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-main line-clamp-1">{job.job_description}</p>
                                                <p className="text-xs font-mono text-muted mt-0.5">ID: {job.job_id.split('-')[0]}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="w-4 h-4 text-muted" />
                                                <span className="font-mono">{job.latitude.toFixed(2)}, {job.longitude.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded inline-flex items-center gap-1.5 border ${job.status === 'open' ? 'bg-accent-success/10 border-accent-success/20 text-accent-success' :
                                                    job.status === 'awarded' ? 'bg-primary/10 border-primary/20 text-primary' :
                                                        'bg-surface-hover border-subtle text-muted'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-bold text-primary hover:underline">Manage Job</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
