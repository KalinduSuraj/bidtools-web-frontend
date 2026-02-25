'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, PackagePlus, Anchor, DollarSign, Settings2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ItemsAPI } from '@/lib/api/items.api';

export default function NewInventoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'earthmoving',
        description: '',
        daily_rate: '',
        condition: 'good',
        serial_number: ''
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
            setError("You must be logged in as a supplier.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const payload = {
                supplier_id: user.user_id,
                name: formData.name,
                category: formData.category,
                description: formData.description,
                daily_rate: Number(formData.daily_rate),
                availability_status: 'available' as const
            };

            await ItemsAPI.createItem(payload);
            setSuccess(true);

            setTimeout(() => {
                router.push('/supplier/inventory');
            }, 1500);

        } catch (err: any) {
            console.error("Failed to add inventory:", err);
            setError(err.response?.data?.message || "An error occurred while adding the equipment. Please check your inputs.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <Link
                    href="/supplier/inventory"
                    className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Inventory
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    <PackagePlus className="w-8 h-8 text-primary" /> Add Equipment
                </h1>
                <p className="text-muted">List a new piece of machinery or tool to make it available for bidding and rental.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">Equipment successfully added to your fleet! Redirecting...</p>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface/80 backdrop-blur-md border border-subtle rounded-3xl p-6 sm:p-10 shadow-theme-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-subtle pb-3">
                            <Settings2 className="w-5 h-5 text-muted" /> Specifications
                        </h3>

                        <div className="space-y-2">
                            <label className="text-sm tracking-tight font-semibold text-muted">Equipment Name / Model</label>
                            <input
                                type="text" name="name" required value={formData.name} onChange={handleChange}
                                placeholder="e.g. Caterpillar 320 GC Excavator"
                                className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm tracking-tight font-semibold text-muted">Category</label>
                                <select
                                    name="category" required value={formData.category} onChange={handleChange}
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all appearance-none"
                                >
                                    <option value="earthmoving">Earthmoving</option>
                                    <option value="aerial">Aerial Lifts</option>
                                    <option value="material">Material Handling</option>
                                    <option value="power">Power Generation</option>
                                    <option value="other">Other / Attachments</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm tracking-tight font-semibold text-muted">Condition State</label>
                                <select
                                    name="condition" required value={formData.condition} onChange={handleChange}
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all appearance-none"
                                >
                                    <option value="new">Brand New (0-1 yr)</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good / Standard</option>
                                    <option value="fair">Fair / Heavy Wear</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-subtle pb-3">
                            <DollarSign className="w-5 h-5 text-muted" /> Pricing Strategy
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-subtle pb-4">
                            <div className="space-y-2">
                                <label className="text-sm tracking-tight font-semibold text-muted">Standard Daily Rate (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                    <input
                                        type="number" name="daily_rate" required min="0" step="0.01" value={formData.daily_rate} onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary transition-all text-xl font-bold font-mono"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">/ day</div>
                                </div>
                            </div>
                            <div className="bg-surface-hover/50 rounded-xl p-4 border border-subtle text-sm text-muted flex items-center">
                                <p>Standard rate acts as your anchor price during live bidding. You can always bid lower or higher based on job specifics.</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm tracking-tight font-semibold text-muted">Short Description</label>
                            <textarea
                                name="description" rows={3} value={formData.description} onChange={handleChange}
                                placeholder="Highlight key specs, hours, or recent maintenance..."
                                className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm tracking-tight font-semibold text-muted">Serial Number / VIN (Optional)</label>
                            <div className="relative">
                                <Anchor className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                <input
                                    type="text" name="serial_number" value={formData.serial_number} onChange={handleChange}
                                    placeholder="For internal fleet tracking"
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary transition-all font-mono text-sm uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-subtle gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/supplier/inventory')}
                            className="px-6 py-3 rounded-xl border border-subtle font-medium hover:bg-surface-hover transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-theme-sm transition-all flex items-center gap-2 disabled:opacity-70 group"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PackagePlus className="w-5 h-5" />}
                            Publish to Fleet
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}

