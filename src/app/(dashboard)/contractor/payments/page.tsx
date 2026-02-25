'use client';

import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft, Download, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ContractorPaymentsPage() {
    return (
        <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-primary" /> Billing & Payments
                    </h1>
                    <p className="text-muted">Manage your payment methods, view invoices, and track escrow disbursements.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm disabled:opacity-50">
                        <Download className="w-4 h-4" /> Export Statements
                    </button>
                    <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-theme-sm flex items-center gap-2 transition-colors">
                        Add Payment Method
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Methods & Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-muted" /> Active Cards
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-base border-2 border-primary/30 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-[8px] text-white font-bold italic tracking-wider">VISA</div>
                                    <div>
                                        <p className="font-bold text-main text-sm">•••• •••• •••• 4242</p>
                                        <p className="text-xs text-muted">Expires 12/26</p>
                                    </div>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">Default</span>
                            </div>

                            <button className="w-full py-3 border-2 border-dashed border-subtle hover:border-primary/50 hover:bg-surface-hover rounded-xl text-sm font-bold text-muted hover:text-primary transition-all flex items-center justify-center gap-2">
                                + Add New Card
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                        <h3 className="font-bold text-lg mb-4">Escrow Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted">Funds in Escrow</span>
                                <span className="font-bold text-orange-500">$0.00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted">Cleared & Paid (YTD)</span>
                                <span className="font-bold text-main">$0.00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted">Pending Refunds</span>
                                <span className="font-bold text-main">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-theme-sm h-full flex flex-col">
                        <div className="p-4 border-b border-subtle bg-surface-hover/30 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-muted" />
                            <h3 className="font-bold text-lg">Recent Invoices</h3>
                        </div>

                        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                            <EmptyState
                                title="No Payment History"
                                message="You haven't made any payments yet. When you accept a quote and lock in a rental, the deposit and payment milestones will appear here."
                                icon={<CreditCard className="w-12 h-12 text-primary opacity-30" />}
                            />
                            <Link href="/contractor/requests/new" className="mt-6 inline-block px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary font-bold hover:text-white rounded-xl transition-colors">
                                Find Equipment First
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
