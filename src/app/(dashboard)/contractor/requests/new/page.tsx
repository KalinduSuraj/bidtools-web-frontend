'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, MapPin, Calendar, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { JobsAPI } from '@/lib/api/jobs.api';
import { BiddingAPI } from '@/lib/api/bidding.api';

export default function NewRequestPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        category: '',
        brand: '',
        model: '',
        quantity: '1',
        startDate: '',
        endDate: '',
        location: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.user_id) {
            setError("You must be logged in as a contractor to post a request.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const jobDescription = `${formData.quantity}x ${formData.category} ${formData.brand} ${formData.model}`.trim() + (formData.notes ? ` - Notes: ${formData.notes}` : '');

            // Note: In a real app, geocode the formData.location. 
            // Here we use dummy coordinates for the demo.
            const payload = {
                job_description: jobDescription,
                latitude: 37.7749,
                longitude: -122.4194,
                required_from: new Date(formData.startDate).toISOString(),
                required_to: new Date(formData.endDate).toISOString()
            };

            const jobRes = await JobsAPI.createJob(payload);
            const createdJob = jobRes.data;

            // Register the job in the bidding service so suppliers can place live bids
            try {
                await BiddingAPI.createJobAuction({
                    jobId: createdJob.job_id,
                    jobDetails: {
                        description: createdJob.job_description,
                        latitude: createdJob.latitude,
                        longitude: createdJob.longitude,
                    },
                    startTime: Date.now(),
                    endTime: Math.max(new Date(createdJob.required_to).getTime(), Date.now() + 7 * 86400000),
                    startingPrice: 0,
                });
            } catch (biddingErr) {
                console.warn('Bidding service registration failed (non-blocking):', biddingErr);
            }

            router.push('/contractor/dashboard');
        } catch (err: any) {
            console.error("Failed to create job request:", err);
            setError(err.response?.data?.message || "An error occurred while publishing your request. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <Link
                    href="/contractor/dashboard"
                    className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-4"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create Equipment Request</h1>
                <p className="text-muted">Post a new job to start receiving bids from verified suppliers in your area.</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-hover -z-10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                </div>

                {[
                    { num: 1, label: 'Details', icon: Settings },
                    { num: 2, label: 'Logistics', icon: MapPin },
                    { num: 3, label: 'Review', icon: FileText }
                ].map((s) => (
                    <div key={s.num} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${step >= s.num
                            ? 'bg-primary border-primary text-white shadow-[0_0_15px_var(--color-primary-glow)]'
                            : 'bg-surface border-subtle text-muted'
                            }`}>
                            <s.icon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-semibold ${step >= s.num ? 'text-primary' : 'text-muted'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-surface/80 backdrop-blur-md border border-subtle rounded-3xl p-6 sm:p-10 shadow-theme-lg"
            >
                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }}>

                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold mb-4">Equipment Details</h3>

                            <div className="space-y-2">
                                <label className="text-sm tracking-tight font-semibold text-muted">Equipment Category</label>
                                <select
                                    name="category" required value={formData.category} onChange={handleChange}
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
                                >
                                    <option value="">Select a category</option>
                                    <option value="earthmoving">Earthmoving (Excavators, Loaders)</option>
                                    <option value="aerial">Aerial Lifts (Boom, Scissor)</option>
                                    <option value="material">Material Handling (Forklifts)</option>
                                    <option value="power">Power Generation</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm tracking-tight font-semibold text-muted">Brand Preference (Optional)</label>
                                    <input
                                        type="text" name="brand" value={formData.brand} onChange={handleChange}
                                        placeholder="e.g. Caterpillar, Bobcat"
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm tracking-tight font-semibold text-muted">Specific Model (Optional)</label>
                                    <input
                                        type="text" name="model" value={formData.model} onChange={handleChange}
                                        placeholder="e.g. 320 GC"
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm tracking-tight font-semibold text-muted">Quantity Needed</label>
                                <input
                                    type="number" name="quantity" min="1" required value={formData.quantity} onChange={handleChange}
                                    className="w-full sm:w-1/3 bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold mb-4">Dates & Location</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2 relative">
                                    <label className="text-sm tracking-tight font-semibold text-muted">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                        <input
                                            type="date" name="startDate" required value={formData.startDate} onChange={handleChange}
                                            className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary transition-all cursor-text appearance-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-sm tracking-tight font-semibold text-muted">End Date (Approximate)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                        <input
                                            type="date" name="endDate" required value={formData.endDate} onChange={handleChange}
                                            className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary transition-all appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm tracking-tight font-semibold text-muted">Delivery Location / Site Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                    <input
                                        type="text" name="location" required value={formData.location} onChange={handleChange}
                                        placeholder="Start typing an address or ZIP code..."
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary transition-all"
                                    />
                                </div>
                                {/* Fake Map Mini View */}
                                {formData.location.length > 5 && (
                                    <div className="h-32 mt-2 rounded-xl bg-surface-hover border border-subtle flex items-center justify-center overflow-hidden relative">
                                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }} />
                                        <MapPin className="w-8 h-8 text-primary relative z-10" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm tracking-tight font-semibold text-muted">Additional Notes (Optional)</label>
                                <textarea
                                    name="notes" rows={3} value={formData.notes} onChange={handleChange}
                                    placeholder="Any specific attachments needed or delivery instructions?"
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold mb-4">Review Your Request</h3>

                            <div className="bg-base border border-subtle rounded-2xl p-6 space-y-4 shadow-inner">
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-subtle border-dashed">
                                    <div>
                                        <p className="text-xs text-muted mb-1">Equipment</p>
                                        <p className="font-bold">{formData.quantity}x {formData.category}</p>
                                        <p className="text-sm text-muted">{formData.brand || 'Any brand'} {formData.model ? `- ${formData.model}` : ''}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-1">Location</p>
                                        <p className="font-bold flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{formData.location}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-subtle border-dashed">
                                    <div>
                                        <p className="text-xs text-muted mb-1">Start Date</p>
                                        <p className="font-bold">{formData.startDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-1">End Date</p>
                                        <p className="font-bold">{formData.endDate}</p>
                                    </div>
                                </div>

                                {formData.notes && (
                                    <div>
                                        <p className="text-xs text-muted mb-1">Notes</p>
                                        <p className="text-sm text-main italic">"{formData.notes}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary flex gap-3 items-start">
                                <Settings className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>Once submitted, this request will be broadcast to matching suppliers within a 50-mile radius. You will be notified when bids are received.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-subtle">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(s => s - 1)}
                                className="px-6 py-3 rounded-xl border border-subtle font-medium hover:bg-surface-hover transition-colors"
                            >
                                Back
                            </button>
                        ) : <div />}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-theme-sm transition-all flex items-center gap-2 disabled:opacity-70 group"
                        >
                            {isLoading && step === 3 ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                step === 3 ? 'Publish Request' : 'Next Step'}
                            {!isLoading && step < 3 && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}
