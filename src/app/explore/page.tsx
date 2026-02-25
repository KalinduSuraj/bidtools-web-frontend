'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Moon, Sun, Search, MapPin, Filter, AlertCircle, ArrowRight, Loader2, PackageX, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { JobsAPI } from '@/lib/api/jobs.api';

export default function ExplorePage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        const fetchPublicJobs = async () => {
            try {
                // Fetch nearby jobs globally with a huge radius map to show all active public jobs
                const { data } = await JobsAPI.getNearbyJobs({ latitude: 37.7749, longitude: -122.4194, radiusKm: 100000 });
                setJobs(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch jobs:", err);
                setError("Failed to load marketplace data from the server.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicJobs();
    }, []);

    const handleActionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/register');
    };

    const filteredJobs = jobs.filter(job =>
        job?.job_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-base text-main transition-colors duration-300">
            {/* Navigation */}
            <header className="fixed top-0 w-full border-b border-subtle bg-surface/80 backdrop-blur-md z-50 transition-colors duration-300">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-danger shadow-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block">BidTools</span>
                    </Link>

                    <div className="flex-1 max-w-xl mx-8 hidden md:block">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search active jobs or equipment requests..."
                                className="w-full bg-base border border-subtle text-main rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-theme-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full hover:bg-surface-hover transition-colors text-muted hover:text-main"
                            suppressHydrationWarning
                        >
                            {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-all shadow-theme-sm hover:shadow-theme-lg"
                            >
                                Join Now
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 pt-32 pb-20">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Explore Marketplace</h1>
                        <p className="text-muted">Browse active job requests and equipment needs across the nation.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-subtle bg-surface hover:bg-surface-hover transition-colors text-sm font-medium text-main">
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-subtle bg-surface hover:bg-surface-hover transition-colors text-sm font-medium text-main">
                            <MapPin className="w-4 h-4" /> Location
                        </button>
                        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-subtle bg-primary/10 text-primary border-primary/30 transition-colors text-sm font-medium">
                            <ArrowRight className="w-4 h-4" /> Sort: Newest
                        </button>
                    </div>
                </div>

                {/* Guest Warning Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-main text-sm">You are browsing as a guest.</h4>
                            <p className="text-muted text-xs">Sign up as a supplier to start bidding on these active job requests.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleActionClick}
                        className="flex-shrink-0 px-4 py-2 bg-base rounded-full border border-subtle text-sm font-medium hover:border-primary transition-colors flex items-center gap-2"
                    >
                        Create an Account <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* Equipment / Jobs Grid */}
                {isLoading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-muted border-2 border-dashed border-subtle rounded-2xl">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="font-medium text-main">Loading Marketplace...</p>
                        <p className="text-sm">Fetching active live jobs...</p>
                    </div>
                ) : error ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-accent-danger border-2 border-dashed border-accent-danger/30 rounded-2xl bg-accent-danger/5">
                        <AlertCircle className="w-10 h-10 mb-4" />
                        <p className="font-bold text-lg mb-2">System Error</p>
                        <p className="text-sm font-medium max-w-md text-center">{error}</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-muted border-2 border-dashed border-subtle rounded-2xl">
                        <PackageX className="w-12 h-12 opacity-20 mb-4" />
                        <p className="font-bold text-main text-lg mb-2">No Active Jobs Found</p>
                        <p className="text-sm max-w-sm text-center">There are currently no active public job requests bidding right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredJobs.map((job, index) => {
                            const daysLeft = Math.max(0, Math.ceil((new Date(job.required_from).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    key={job.job_id}
                                    className="group rounded-2xl border border-subtle bg-surface overflow-hidden hover:shadow-theme-lg hover:border-primary/50 transition-all flex flex-col h-full"
                                >
                                    {/* CSS Image Mock representing machinery requirement */}
                                    <div className={`aspect-[4/3] w-full bg-gradient-to-br from-primary/10 to-primary/30 relative flex items-center justify-center p-6 border-b border-subtle overflow-hidden`}>
                                        <div className="absolute inset-0 bg-base/10" />
                                        <div className="w-full h-full border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 transition-transform duration-500 group-hover:scale-105">
                                            <Briefcase className="w-12 h-12 text-primary/70" />
                                        </div>

                                        <div className="absolute top-3 left-3 z-20">
                                            <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${job.status === 'open' ? 'bg-primary text-white' : 'bg-base text-main border border-subtle'}`}>
                                                {job.status === 'open' ? 'Bidding Open' : 'Closed'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <h3 className="font-bold text-lg leading-tight line-clamp-2">{job.job_description}</h3>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm text-muted mt-auto mb-4">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {daysLeft > 0 ? `Required in ${daysLeft} days` : 'Immediate Requirement'}
                                        </div>

                                        <button
                                            onClick={handleActionClick}
                                            className="w-full py-2.5 rounded-xl bg-base border border-subtle text-sm font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-center flex items-center justify-center gap-2 group/btn"
                                        >
                                            <Zap className="w-4 h-4 text-muted group-hover/btn:text-primary transition-colors" />
                                            Sign In to Bid
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
