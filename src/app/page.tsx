'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Package, MapPin, Calendar, DollarSign, Loader2, Search, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { JobsAPI } from '@/lib/api/jobs.api';
import { ItemsAPI } from '@/lib/api/items.api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LandingPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    const [jobs, setJobs] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [jobSearch, setJobSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await JobsAPI.getNearbyJobs({ latitude: 6.9, longitude: 79.86, radiusKm: 100000 });
                setJobs(Array.isArray(data) ? data : []);
            } catch { setJobs([]); }
            finally { setJobsLoading(false); }
        };

        const fetchItems = async () => {
            try {
                const { data } = await ItemsAPI.getAllItems();
                setItems(Array.isArray(data) ? data : []);
            } catch { setItems([]); }
            finally { setItemsLoading(false); }
        };

        fetchJobs();
        fetchItems();
    }, []);

    const handleJobClick = (jobId: string) => {
        if (isAuthenticated) {
            const role = typeof user?.role === 'object' ? user?.role?.name : user?.role;
            if (role === 'supplier') {
                router.push(`/supplier/bids/${jobId}`);
            } else {
                router.push(`/contractor/requests/${jobId}`);
            }
        } else {
            router.push('/login');
        }
    };

    const handleItemClick = (itemId: string) => {
        if (isAuthenticated) {
            const role = typeof user?.role === 'object' ? user?.role?.name : user?.role;
            if (role === 'supplier') {
                router.push(`/supplier/inventory/${itemId}`);
            } else {
                router.push('/contractor/dashboard');
            }
        } else {
            router.push('/login');
        }
    };

    const filteredJobs = jobs.filter(j =>
        (j.job_description || '').toLowerCase().includes(jobSearch.toLowerCase())
    );
    const filteredItems = items.filter(i =>
        (i.name || '').toLowerCase().includes(itemSearch.toLowerCase()) ||
        (i.description || '').toLowerCase().includes(itemSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-base text-main relative overflow-hidden flex flex-col transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-glow blur-[120px] opacity-70" />
                    <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent-success/10 blur-[100px] opacity-60" />
                </div>

                <div className="container mx-auto px-6 py-12 lg:py-24 flex flex-col lg:flex-row items-center gap-16">
                    {/* Left: Text Content */}
                    <div className="flex-1 space-y-8 flex flex-col items-start z-10 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-subtle shadow-theme-sm text-sm font-medium text-primary"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-success"></span>
                            </span>
                            Live Equipment Marketplace
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
                        >
                            Rent Equipment <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-danger">
                                Smarter & Faster
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-muted max-w-xl leading-relaxed"
                        >
                            The premier bidding platform for contractors and suppliers. Browse active jobs, discover available equipment, and secure the best rates.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex items-center gap-4"
                        >
                            <Link
                                href={isAuthenticated ? '#jobs' : '/register'}
                                className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-primary-hover shadow-theme-lg transition-all flex items-center gap-2 group"
                            >
                                {isAuthenticated ? 'Browse Jobs' : 'Get Started'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/about"
                                className="px-8 py-4 rounded-full border border-subtle text-main font-semibold text-lg hover:bg-surface-hover transition-all"
                            >
                                Learn More
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="grid grid-cols-3 gap-8 pt-8 w-full max-w-md"
                        >
                            <div>
                                <p className="text-3xl font-black text-primary">{jobs.length}</p>
                                <p className="text-xs text-muted font-medium mt-1">Active Jobs</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-primary">{items.length}</p>
                                <p className="text-xs text-muted font-medium mt-1">Equipment Listed</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-primary">24/7</p>
                                <p className="text-xs text-muted font-medium mt-1">Live Bidding</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Animated Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="flex-1 w-full max-w-2xl relative"
                    >
                        <div className="relative rounded-2xl border border-subtle bg-surface/50 backdrop-blur-xl shadow-theme-lg p-6 lg:p-8 overflow-hidden aspect-video flex flex-col gap-6">
                            {/* Header Mock */}
                            <div className="flex justify-between items-center pb-4 border-b border-subtle">
                                <div className="h-6 w-32 bg-subtle rounded-md"></div>
                                <div className="flex gap-2">
                                    <div className="h-3 w-3 rounded-full bg-accent-danger shadow-[0_0_10px_var(--color-accent-danger)]"></div>
                                    <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"></div>
                                    <div className="h-3 w-3 rounded-full bg-accent-success shadow-[0_0_10px_var(--color-accent-success)]"></div>
                                </div>
                            </div>

                            {/* Chart Mock */}
                            <div className="flex-1 flex items-end gap-3 pb-2 justify-between">
                                {[40, 65, 30, 85, 50, 95, 75].map((height, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: '0%' }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                        className="w-full bg-gradient-to-t from-primary-glow to-primary rounded-t-sm"
                                    />
                                ))}
                            </div>

                            {/* Floating Card */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute right-0 -bottom-6 w-64 p-5 rounded-xl border border-subtle bg-surface shadow-theme-lg flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted">Winning Bid</span>
                                    <span className="px-2 py-1 rounded bg-accent-success/10 text-accent-success text-xs font-bold">Live</span>
                                </div>
                                <div className="text-2xl font-bold font-mono">$450.00/day</div>
                                <div className="h-1.5 w-full bg-subtle rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Active Jobs Section */}
            <section id="jobs" className="py-20 bg-surface/30">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Active Jobs</h2>
                            </div>
                            <p className="text-muted">Browse equipment requests from contractors</p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                                type="text"
                                value={jobSearch}
                                onChange={(e) => setJobSearch(e.target.value)}
                                placeholder="Search jobs..."
                                className="w-full bg-base border border-subtle text-main rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                            />
                        </div>
                    </div>

                    {jobsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-20 text-muted">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>No active jobs found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.map((job, i) => (
                                <motion.div
                                    key={job.job_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    onClick={() => handleJobClick(job.job_id)}
                                    className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm hover:shadow-theme-lg hover:border-primary/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-accent-success/10 text-accent-success border border-accent-success/20 uppercase">
                                            {job.status || 'Open'}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-main text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {job.job_description || 'Untitled Job'}
                                    </h3>
                                    <div className="space-y-2 text-sm text-muted">
                                        {(job.latitude && job.longitude) && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                                <span>{Number(job.latitude).toFixed(4)}, {Number(job.longitude).toFixed(4)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                            <span>
                                                {job.required_from ? new Date(job.required_from).toLocaleDateString() : 'TBD'} — {job.required_to ? new Date(job.required_to).toLocaleDateString() : 'TBD'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-subtle flex items-center justify-between">
                                        <span className="text-xs text-muted">{job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</span>
                                        <span className="text-xs font-bold text-primary group-hover:underline">
                                            {isAuthenticated ? 'View Details' : 'Sign in to bid'} &rarr;
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Available Equipment Section */}
            <section id="items" className="py-20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-accent-success/10 text-accent-success">
                                    <Package className="w-5 h-5" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Available Equipment</h2>
                            </div>
                            <p className="text-muted">Discover equipment listed by suppliers</p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                                type="text"
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                placeholder="Search equipment..."
                                className="w-full bg-base border border-subtle text-main rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                            />
                        </div>
                    </div>

                    {itemsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20 text-muted">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>No equipment found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map((item, i) => (
                                <motion.div
                                    key={item.item_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    onClick={() => handleItemClick(item.item_id)}
                                    className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-theme-sm hover:shadow-theme-lg hover:border-primary/30 transition-all cursor-pointer group"
                                >
                                    {/* Item visual header */}
                                    <div className="h-32 bg-gradient-to-br from-primary/5 to-accent-success/5 flex items-center justify-center border-b border-subtle">
                                        <Package className="w-12 h-12 text-primary/30" />
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-main text-base group-hover:text-primary transition-colors line-clamp-1">
                                                {item.name || 'Unnamed Equipment'}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'available' ? 'bg-accent-success/10 text-accent-success' : 'bg-orange-500/10 text-orange-500'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        {item.description && (
                                            <p className="text-xs text-muted mb-3 line-clamp-2">{item.description}</p>
                                        )}
                                        <div className="flex items-center justify-between pt-3 border-t border-subtle">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5 text-accent-success" />
                                                <span className="font-bold text-main text-sm">{item.price_per_day}</span>
                                                <span className="text-xs text-muted">/day</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5 text-primary" />
                                                <span className="font-bold text-main text-sm">{item.price_per_hour}</span>
                                                <span className="text-xs text-muted">/hr</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-surface/30">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Ready to start bidding?</h2>
                        <p className="text-muted max-w-xl mx-auto mb-8">
                            Join thousands of contractors and suppliers already using BidTools to find the best equipment deals.
                        </p>
                        <Link
                            href={isAuthenticated ? '#jobs' : '/register'}
                            className="inline-flex px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-primary-hover shadow-theme-lg transition-all items-center gap-2 group"
                        >
                            {isAuthenticated ? 'Browse Marketplace' : 'Create Free Account'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
