'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, DollarSign, Calculator, Send, AlertCircle, ShieldCheck, MapPin, Calendar, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { JobsAPI } from '@/lib/api/jobs.api';
import { ItemsAPI } from '@/lib/api/items.api';
import { BidsAPI } from '@/lib/api/bids.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

export default function SubmitBidPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [job, setJob] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        item_id: '',
        bid_amount: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.user_id) return;
            setIsLoading(true);
            try {
                const [jobRes, invRes] = await Promise.all([
                    JobsAPI.getJobById(jobId),
                    ItemsAPI.getSupplierItems(user.user_id)
                ]);
                setJob(jobRes.data);
                // Only show available items for bidding
                const availableItems = (Array.isArray(invRes.data) ? invRes.data : []).filter(item => item.status === 'available');
                setInventory(availableItems);
            } catch (err: any) {
                console.error("Failed to load bid data:", err);
                setError(err.response?.data?.message || "Failed to load job details. The request might have been closed.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user?.user_id, jobId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.user_id) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await BidsAPI.placeBid({
                jobId: jobId,
                amount: Number(formData.bid_amount),
                items: formData.item_id ? [{ itemId: formData.item_id, quantity: 1 }] : undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/supplier/dashboard');
            }, 2000);
        } catch (err: any) {
            console.error("Failed to submit bid:", err);
            console.error("Response data:", JSON.stringify(err.response?.data));
            const msg = err.response?.data?.message;
            const detail = Array.isArray(msg) ? msg.join(', ') : (typeof msg === 'string' ? msg : JSON.stringify(err.response?.data));
            setError(detail || "Failed to submit bid. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <LoadingWindow fullScreen message="Preparing Bid Workspace..." />;
    }

    if (error && !job) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <ErrorWindow message={error} />
                <Link href="/supplier/request-feed" className="mt-4 inline-block text-primary hover:underline">
                    &larr; Return to Request Feed
                </Link>
            </div>
        );
    }

    const selectedItem = inventory.find(i => i.item_id === formData.item_id);

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <Link href="/supplier/request-feed" className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Request Feed
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    <Send className="w-8 h-8 text-primary" /> Submit Quote
                </h1>
                <p className="text-muted">Propose your equipment and rate for this contractor's request.</p>
            </div>

            {success ? (
                <div className="p-8 rounded-2xl bg-accent-success/10 border border-accent-success/30 text-center animate-in zoom-in-95">
                    <ShieldCheck className="w-16 h-16 text-accent-success mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-accent-success mb-2">Bid Submitted Successfully!</h2>
                    <p className="text-main">The contractor has been notified. Redirecting you to your dashboard...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Job Details Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm sticky top-6">
                            <h3 className="text-lg font-bold border-b border-subtle pb-3 mb-4">Request Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted mb-1">Description</p>
                                    <p className="font-semibold text-main">{job?.job_description}</p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted">Delivery Location</p>
                                        <p className="text-sm font-medium">Lat: {job?.latitude}, Lng: {job?.longitude}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted">Required Dates</p>
                                        <p className="text-sm font-medium">
                                            {job?.required_from ? new Date(job.required_from).toLocaleDateString() : 'TBD'} -
                                            {job?.required_to ? new Date(job.required_to).toLocaleDateString() : 'TBD'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bidding Form */}
                    <div className="lg:col-span-2">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="bg-surface/80 backdrop-blur-md border border-subtle rounded-3xl p-6 sm:p-8 shadow-theme-lg space-y-8">

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-subtle pb-3">
                                    <CheckSquare className="w-5 h-5 text-muted" /> Select Equipment
                                </h3>

                                {inventory.length === 0 ? (
                                    <div className="p-6 text-center border-2 border-dashed border-subtle rounded-xl bg-surface-hover/30">
                                        <p className="text-muted mb-4">You have no available equipment in your inventory to bid with.</p>
                                        <Link href="/supplier/inventory/new" className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">Add Item to Fleet</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {inventory.map(item => (
                                            <label
                                                key={item.item_id}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.item_id === item.item_id ? 'border-primary bg-primary/5' : 'border-subtle hover:border-primary/50 bg-base'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="radio"
                                                        name="item"
                                                        value={item.item_id}
                                                        checked={formData.item_id === item.item_id}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                                                        className="w-4 h-4 text-primary focus:ring-primary"
                                                        required
                                                    />
                                                    <div>
                                                        <p className="font-bold text-main">{item.name}</p>
                                                        <p className="text-xs text-muted">{item.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">${item.price_per_day}/day</p>
                                                    <p className="text-[10px] text-muted">Standard Rate</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={`space-y-4 transition-all duration-300 ${!formData.item_id ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-subtle pb-3">
                                    <Calculator className="w-5 h-5 text-muted" /> Your Quote
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-sm tracking-tight font-semibold text-muted">Proposed Total Deal Amount (USD)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            step="0.01"
                                            value={formData.bid_amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bid_amount: e.target.value }))}
                                            placeholder="Enter total bid amount"
                                            className="w-full bg-base border border-subtle text-main rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary transition-all text-2xl font-bold font-mono"
                                        />
                                    </div>
                                    {selectedItem && formData.bid_amount && (
                                        <div className="mt-2 text-sm text-muted bg-surface-hover/50 p-3 rounded-lg border border-subtle">
                                            A standard rental of this item for <strong className="text-primary">${selectedItem.price_per_day}/day</strong> over the requested duration might vary from your bulk quote. Make sure your total encompasses logistics.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-subtle">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.item_id}
                                    className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-theme-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                    Submit Binding Quote
                                </button>
                                <p className="text-center text-xs text-muted mt-4">By submitting this quote, you agree to fulfill the order at this price if accepted by the contractor.</p>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
