'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Clock, ArrowRight, Activity, Zap } from 'lucide-react';
import { JobsAPI } from '@/lib/api/jobs.api';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';
import { MapView } from '@/components/map/MapView';
import Link from 'next/link';

export default function RequestFeedPage() {
    const { coordinates, error: geoError, isLoading: geoLoading } = useGeolocation();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [radius, setRadius] = useState(50); // initial 50km
    const debouncedRadius = useDebounce(radius, 500);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            if (geoLoading) return;

            setIsLoading(true);
            setError(null);

            try {
                // Default to SF if geolocation fails
                const lat = coordinates?.lat || 37.7749;
                const lon = coordinates?.lng || -122.4194;

                const { data } = await JobsAPI.getNearbyJobs({ lat, lon, radius: debouncedRadius });
                setJobs(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error('Failed to fetch nearby jobs:', err);
                setError(err.response?.data?.message || 'Failed to fetch job requests in your area.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [coordinates, geoLoading, debouncedRadius]);

    const filteredJobs = jobs.filter(job =>
        job.job_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const mapCenter = coordinates || { lat: 37.7749, lng: -122.4194 };

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" /> Request Feed
                    </h1>
                    <p className="text-muted">Live view of equipment demands in your service radius.</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:w-48">
                        <label className="text-xs font-semibold text-muted flex justify-between">
                            <span>Service Radius</span>
                            <span className="text-main">{radius} km</span>
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="200"
                            step="5"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* List View */}
                <div className="lg:col-span-1 bg-surface border border-subtle rounded-2xl shadow-theme-sm flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-subtle bg-surface-hover/50 space-y-3 shrink-0">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search demands..."
                                className="w-full bg-base border border-subtle text-main rounded-lg py-2 pl-9 pr-3 focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-muted">
                            <span>{filteredJobs.length} Results Found</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" /> Live API Connect</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {geoLoading || isLoading ? (
                            <div className="p-8 text-center text-muted">
                                <LoadingWindow message="Searching active demands..." />
                            </div>
                        ) : error ? (
                            <div className="p-4">
                                <ErrorWindow message={error} />
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="p-4 mt-8">
                                <EmptyState
                                    title="No Demands Found"
                                    message={`There are no active requests within ${radius}km.`}
                                    icon={<Activity className="w-10 h-10 opacity-30" />}
                                />
                            </div>
                        ) : (
                            filteredJobs.map((job) => (
                                <div key={job.job_id} className="p-4 rounded-xl border border-subtle bg-base hover:bg-surface-hover hover:border-primary/30 transition-all group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-muted">{job.job_id.split('-')[0]}</span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">New API Demo</span>
                                    </div>
                                    <h4 className="font-bold text-main mb-1.5 text-sm line-clamp-2">{job.job_description}</h4>

                                    <div className="flex items-center justify-between text-xs text-muted mb-3">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Needed soon</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {Math.floor(Math.random() * 50) + 1} km away</span>
                                    </div>

                                    <Link
                                        href={`/supplier/bids/${job.job_id}`}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-semibold text-sm transition-colors border border-transparent group-hover:border-primary"
                                    >
                                        Bid Now <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Map View */}
                <div className="lg:col-span-2 bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden h-full relative isolate p-1">
                    <div className="absolute top-4 left-4 z-10 bg-surface/90 backdrop-blur-md p-3 rounded-xl border border-subtle shadow-theme-lg">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            Dynamic Radius View
                        </h3>
                        <p className="text-xs text-muted mt-0.5 ml-6">Currently probing {radius}km</p>
                    </div>

                    <MapView
                        center={mapCenter}
                        zoom={10}
                        interactive={true}
                        radius={radius * 1000} // MapView radius is in meters
                        markers={filteredJobs.map(j => ({
                            id: j.job_id,
                            lat: j.latitude || mapCenter.lat + (Math.random() - 0.5) * 0.1,
                            lng: j.longitude || mapCenter.lng + (Math.random() - 0.5) * 0.1,
                            title: j.job_description
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}
