'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Edit, Trash2, Loader2, Package, Calendar, DollarSign, Settings2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ItemsAPI } from '@/lib/api/items.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

export default function SupplierItemDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
    const { itemId } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [item, setItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        price_per_day: '',
        price_per_hour: '',
        status: '',
    });

    useEffect(() => {
        const fetchItem = async () => {
            setIsLoading(true);
            try {
                const { data } = await ItemsAPI.getItemById(itemId);
                setItem(data);
                setEditData({
                    price_per_day: String(data.price_per_day || ''),
                    price_per_hour: String(data.price_per_hour || ''),
                    status: data.status || 'available',
                });
            } catch (err: any) {
                console.error('Failed to load item:', err);
                setError(err.response?.data?.message || 'Failed to load item details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    const handleDelete = async () => {
        if (!user?.user_id) return;
        if (!confirm('Are you sure you want to permanently delete this equipment from your fleet?')) return;
        setIsDeleting(true);
        try {
            await ItemsAPI.deleteItem(user.user_id, itemId);
            router.push('/supplier/inventory');
        } catch (err: any) {
            console.error('Failed to delete item:', err);
            setIsDeleting(false);
        }
    };

    const handleSave = async () => {
        if (!user?.user_id) return;
        try {
            const { data } = await ItemsAPI.updateItem(user.user_id, itemId, {
                price_per_day: Number(editData.price_per_day),
                price_per_hour: Number(editData.price_per_hour),
            });
            setItem(data);
            setIsEditing(false);
        } catch (err: any) {
            console.error('Failed to update item:', err);
        }
    };

    if (isLoading) return <LoadingWindow fullScreen message="Loading equipment details..." />;

    if (error) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <ErrorWindow message={error} />
                <Link href="/supplier/inventory" className="mt-4 inline-block text-primary hover:underline">&larr; Back to Inventory</Link>
            </div>
        );
    }

    const statusColor = item?.status === 'available'
        ? 'bg-accent-success/10 text-accent-success border-accent-success/20'
        : item?.status === 'rented'
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'bg-orange-500/10 text-orange-500 border-orange-500/20';

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
            <Link href="/supplier/inventory" className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Inventory
            </Link>

            {/* Header */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-main mb-1">{item?.name}</h1>
                        <p className="text-sm text-muted">{item?.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${statusColor}`}>
                            {item?.status}
                        </span>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors"
                        >
                            <Edit className="w-4 h-4" /> {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-xl text-sm font-bold border border-accent-danger/20 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipment Details */}
                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-4">
                    <h3 className="font-bold text-lg border-b border-subtle pb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-muted" /> Equipment Details
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">Item ID</span>
                            <span className="text-sm font-mono text-main">{item?.item_id?.split('-')[0]}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">Name</span>
                            <span className="text-sm font-semibold text-main">{item?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">Description</span>
                            <span className="text-sm text-main">{item?.description || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">Location</span>
                            <span className="text-sm text-main">{item?.latitude}, {item?.longitude}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">Added</span>
                            <span className="text-sm text-main">{item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Editable Fields */}
                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-4">
                    <h3 className="font-bold text-lg border-b border-subtle pb-3 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-muted" /> {isEditing ? 'Edit Details' : 'Pricing & Status'}
                    </h3>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted">Price Per Day (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={editData.price_per_day}
                                        onChange={(e) => setEditData(d => ({ ...d, price_per_day: e.target.value }))}
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-9 pr-4 focus:ring-1 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted">Price Per Hour (USD)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editData.price_per_hour}
                                        onChange={(e) => setEditData(d => ({ ...d, price_per_hour: e.target.value }))}
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-9 pr-4 focus:ring-1 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted">Status</label>
                                <select
                                    value={editData.status}
                                    onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))}
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-1 focus:border-primary transition-all text-sm"
                                >
                                    <option value="available">Available</option>
                                    <option value="rented">Rented</option>
                                    <option value="maintenance">Under Maintenance</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-theme-sm transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-subtle/50">
                                <span className="text-sm text-muted">Daily Rate</span>
                                <span className="text-lg font-black text-primary">${item?.price_per_day}/day</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-subtle/50">
                                <span className="text-sm text-muted">Hourly Rate</span>
                                <span className="text-sm font-semibold text-main">${item?.price_per_hour}/hr</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-muted">Status</span>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusColor}`}>
                                    {item?.status}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
