'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, Search, AlertCircle, ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { PaymentsAPI } from '@/lib/api/payments.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

export default function AdminFinancePage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await PaymentsAPI.getPayments();
            const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setPayments(sorted);
        } catch (err: any) {
            console.error("Failed to load financial data:", err);
            setError(err.response?.data?.message || "Failed to load the financial ledger.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p =>
        String(p.payment_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.rental_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalVolume = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-accent-success" /> Financial Ledger
                    </h1>
                    <p className="text-muted">Global oversight of all platform transactions and escrow milestones.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={fetchPayments} className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-theme-sm flex items-center gap-2 hover:bg-primary-hover transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-accent-success/10 text-accent-success">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Total Volume Processed</h3>
                    </div>
                    <p className="text-4xl font-black text-main">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-accent-success">
                        <ArrowUpRight className="w-3.5 h-3.5" /> +12.5% this month
                    </div>
                </div>

                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Completed Transactions</h3>
                    </div>
                    <p className="text-4xl font-black text-main">{completedPayments}</p>
                    <p className="text-sm text-muted mt-2 tracking-tight">Fully processed and paid out</p>
                </div>

                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Payments in Escrow</h3>
                    </div>
                    <p className="text-4xl font-black text-main">{pendingPayments}</p>
                    <p className="text-sm text-muted mt-2 tracking-tight">Active jobs awaiting completion</p>
                </div>
            </div>

            {/* Ledger Table Section */}
            <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-theme-sm">
                <div className="p-4 border-b border-subtle bg-surface-hover/30 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Transaction History</h3>
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search payment ID or context..."
                            className="w-full bg-base border border-subtle text-main rounded-lg py-2 pl-9 pr-3 focus:ring-1 focus:border-primary transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted bg-surface-hover/50">
                                <th className="px-6 py-4 font-medium">Transaction Context</th>
                                <th className="px-6 py-4 font-medium">Amount & Method</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Timestamp</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle relative">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center border-none">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                                        <p className="text-muted">Syncing ledger with payment gateway...</p>
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
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-muted">No transactions found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.payment_id} className="hover:bg-surface-hover/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-main">Agreement #{String(payment.rental_id || '').split('-')[0] || 'Unknown'}</p>
                                                <p className="text-xs font-mono text-muted">Txn ID: {String(payment.payment_id || '').split('-')[0]}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-base border border-subtle flex items-center justify-center">
                                                    <CreditCard className="w-4 h-4 text-muted" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-main tracking-tight">${Number(payment.amount).toFixed(2)}</p>
                                                    <p className="text-[10px] uppercase font-bold text-muted">{payment.payment_method?.replace('_', ' ') || 'Unknown Method'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded inline-flex items-center gap-1.5 border ${payment.status === 'completed' ? 'bg-accent-success/10 border-accent-success/20 text-accent-success' :
                                                    payment.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                                        'bg-surface-hover border-subtle text-muted'
                                                }`}>
                                                {payment.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">
                                            {new Date(payment.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-bold text-primary hover:underline">View Receipt</button>
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
