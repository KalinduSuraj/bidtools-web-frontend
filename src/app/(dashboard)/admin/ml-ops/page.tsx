'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, Activity, LineChart, ShieldCheck, Zap, Database, Settings, BarChart2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminMLOpsPage() {
    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-[#8b5cf6]" /> ML-Ops Dashboard
                    </h1>
                    <p className="text-muted">Manage the machine learning models and data pipelines powering BidTools' smarts.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-bold border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm">
                        <LineChart className="w-4 h-4" /> View TensorBoard
                    </button>
                </div>
            </div>

            {/* AI Control Center Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Models */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-muted" /> Production Models
                        </h3>

                        <div className="space-y-4">
                            {[
                                { name: 'Smart Matching Engine', version: 'v2.4.1', status: 'Healthy', accuracy: '94.2%', latency: '42ms' },
                                { name: 'Fraud Detection Net', version: 'v1.1.0', status: 'Healthy', accuracy: '99.8%', latency: '18ms' },
                                { name: 'Dynamic Price Estimator', version: 'v3.0.2', status: 'Retraining needed', accuracy: '82.1%', latency: '120ms', warning: true },
                            ].map((model) => (
                                <div key={model.name} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-subtle bg-base hover:bg-surface transition-colors group">
                                    <div className="flex flex-col mb-3 sm:mb-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-main">{model.name}</span>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-subtle">{model.version}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-muted">
                                            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Accuracy: {model.accuracy}</span>
                                            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Latency: {model.latency}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded inline-flex items-center gap-1 border ${model.warning ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-accent-success/10 text-accent-success border-accent-success/20'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${model.warning ? 'bg-orange-500' : 'bg-accent-success'} animate-pulse`} />
                                            {model.status}
                                        </span>
                                        <button className="p-2 text-muted hover:text-main hover:bg-surface border border-transparent hover:border-subtle rounded-lg transition-all">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-subtle rounded-2xl p-8 shadow-theme-sm text-center">
                        <EmptyState
                            title="No New Pipeline Jobs"
                            message="All scheduled data ingestion and retraining pipelines have concluded successfully for the current week."
                            icon={<Database className="w-12 h-12 text-[#8b5cf6] opacity-30" />}
                        />
                    </div>
                </div>

                {/* System Metrics */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-muted" /> Compute Usage
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-muted">GPU Utilization (A100 Cluster)</span>
                                    <span className="text-orange-500">76%</span>
                                </div>
                                <div className="w-full h-2 bg-base rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '76%' }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-muted">Inference Memory</span>
                                    <span className="text-primary">42%</span>
                                </div>
                                <div className="w-full h-2 bg-base rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '42%' }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm font-semibold mb-2">
                                    <span className="text-muted">Data Pipeline Throughput</span>
                                    <span className="text-accent-success">28%</span>
                                </div>
                                <div className="w-full h-2 bg-base rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-success rounded-full" style={{ width: '28%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-subtle">
                            <button className="w-full py-3 bg-base border border-subtle hover:bg-surface hover:border-[#8b5cf6] text-[#8b5cf6] rounded-xl font-bold transition-all text-sm">
                                Scale Compute Cluster
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
