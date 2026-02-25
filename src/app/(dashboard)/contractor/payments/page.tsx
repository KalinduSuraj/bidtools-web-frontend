'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, RefreshCw, FileText, DollarSign, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PaymentsAPI } from '@/lib/api/payments.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ContractorPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            console.error('Failed to load payments:', err);
            setError(err.response?.data?.message || 'Failed to load payment history.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const totalPaid = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    if (isLoading) return <LoadingWindow fullScreen message="Loading payments..." />;

    return (
        <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-primary" /> Billing & Payments
                    </h1>
                    <p className="text-muted">View invoices and track payment history.</p>
                </div>
                <button onClick={fetchPayments} className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm">
                    <p className="text-sm font-bold text-muted uppercase tracking-wider">Total Paid</p>
                    <p className="text-3xl font-black text-accent-success mt-2">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm">
                    <p className="text-sm font-bold text-muted uppercase tracking-wider">Pending</p>
                    <p className="text-3xl font-black text-orange-500 mt-2">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-surface border border-subtle rounded-2xl p-5 shadow-theme-sm">
                    <p className="text-sm font-bold text-muted uppercase tracking-wider">Transactions</p>
                    <p className="text-3xl font-black text-main mt-2">{payments.length}</p>
                </div>
            </div>

            {error && <ErrorWindow message={error} />}

            {/* Payment History */}
            <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-theme-sm">
                <div className="p-4 border-b border-subtle bg-surface-hover/30 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted" />
                    <h3 className="font-bold text-lg">Payment History</h3>
                </div>

                {payments.length === 0 ? (
                    <div className="p-8">
                        <EmptyState
                            title="No Payment History"
                            message="You haven't made any payments yet. Payments will appear here once rental agreements are created."
                            icon={<CreditCard className="w-12 h-12 text-primary opacity-30" />}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted bg-surface-hover/50">
                                    <th className="px-6 py-4 font-medium">Payment</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Method</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-subtle">
                                {payments.map((payment, i) => (
                                    <motion.tr
                                        key={payment.payment_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-surface-hover/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-main text-sm">Rental #{String(payment.rental_id)}</p>
                                            <p className="text-xs text-muted font-mono">ID: {String(payment.payment_id).split('-')[0]}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-main">${Number(payment.amount).toFixed(2)}</p>
                                            <p className="text-[10px] uppercase text-muted">{payment.currency || 'USD'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted capitalize">{payment.payment_method?.replace('_', ' ') || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded inline-flex items-center gap-1.5 border ${
                                                payment.status === 'completed' ? 'bg-accent-success/10 border-accent-success/20 text-accent-success' :
                                                payment.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                                'bg-accent-danger/10 border-accent-danger/20 text-accent-danger'
                                            }`}>
                                                {payment.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {payment.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted">{new Date(payment.created_at).toLocaleDateString()}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
