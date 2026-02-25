'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Settings2, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { ItemsAPI } from '@/lib/api/items.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

export default function SupplierInventory() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInventory = async () => {
            if (!user?.user_id) return;
            try {
                const { data } = await ItemsAPI.getSupplierItems(user.user_id);
                setInventory(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch inventory:", err);
                setError(err.response?.data?.message || "Failed to load inventory data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInventory();
    }, [user]);

    const toggleMenu = (id: string) => {
        if (activeMenu === id) setActiveMenu(null);
        else setActiveMenu(id);
    };

    const filteredInventory = inventory.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Inventory Management</h1>
                    <p className="text-muted">Manage your equipment fleet, update status, and adjust daily rates.</p>
                </div>

                <Link href="/supplier/inventory/new" className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-theme-lg transition-all flex items-center gap-2 hover:-translate-y-0.5">
                    <Plus className="w-5 h-5" />
                    Add Equipment
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-surface border border-subtle shadow-theme-sm">
                <div className="relative w-full sm:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, ID, or category..."
                        className="w-full bg-base border border-subtle text-main rounded-xl py-2 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-base hover:bg-surface-hover transition-colors text-sm font-medium text-main">
                        <Filter className="w-4 h-4" /> Filter Status
                    </button>
                    <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-base hover:bg-surface-hover transition-colors text-sm font-medium text-main">
                        <Settings2 className="w-4 h-4" /> Columns
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <LoadingWindow message="Loading Fleet Inventory..." submessage="Fetching real-time equipment data from the server." />
            ) : error ? (
                <ErrorWindow message={error} />
            ) : filteredInventory.length === 0 ? (
                <EmptyState
                    title="No Equipment Found"
                    message="You haven't listed any equipment in your inventory yet, or no items match your search criteria."
                />
            ) : (
                <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted bg-surface-hover/50">
                                <th className="p-4 font-medium pl-6">Equipment Details</th>
                                <th className="p-4 font-medium">Description</th>
                                <th className="p-4 font-medium">Daily Rate</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle">
                            {filteredInventory.map((item) => (
                                <tr key={item.item_id} className="hover:bg-surface-hover/30 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-base border border-subtle flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-mono text-muted">{item.item_id?.split('-')[0] || 'ID'}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-main">{item.name}</p>
                                                <p className="text-xs font-mono text-muted">{item.item_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-muted">{item.description || '—'}</td>
                                    <td className="p-4 font-mono font-bold text-main">${item.price_per_day}<span className="text-xs text-muted font-normal">/day</span></td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border ${item.status === 'available' ? 'bg-accent-success/10 text-accent-success border-accent-success/20' :
                                            item.status === 'rented' ? 'bg-primary/10 text-primary border-primary/20' :
                                                item.status === 'maintenance' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                    'bg-surface-hover text-muted border-subtle'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'available' ? 'bg-accent-success' :
                                                item.status === 'rented' ? 'bg-primary' :
                                                    item.status === 'maintenance' ? 'bg-orange-500' :
                                                        'bg-muted'
                                                }`} />
                                            {item.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right pr-6 relative">
                                        <button
                                            onClick={() => toggleMenu(item.item_id)}
                                            className="p-2 rounded-lg text-muted hover:text-main hover:bg-base border border-transparent hover:border-subtle transition-all"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenu === item.item_id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                <div className="absolute right-8 top-12 w-48 bg-surface border border-subtle rounded-xl shadow-theme-lg z-20 overflow-hidden text-left py-1 animate-in fade-in zoom-in-95 duration-100">
                                                    <button className="w-full px-4 py-2 text-sm text-main hover:bg-surface-hover flex items-center gap-2 transition-colors">
                                                        <Edit className="w-4 h-4 text-muted" /> Edit Details
                                                    </button>
                                                    <button className="w-full px-4 py-2 text-sm text-main hover:bg-surface-hover flex items-center gap-2 transition-colors">
                                                        <Settings2 className="w-4 h-4 text-muted" /> Change Status
                                                    </button>
                                                    <div className="h-px bg-subtle my-1 w-full" />
                                                    <button className="w-full px-4 py-2 text-sm text-accent-danger hover:bg-accent-danger/10 flex items-center gap-2 transition-colors">
                                                        <Trash2 className="w-4 h-4 text-accent-danger" /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
