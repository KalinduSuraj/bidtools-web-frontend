'use client';

import { MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminDisputesPage() {
    // Mock data as there are no OpenAPI endpoints for disputes yet
    const disputes = [
        { id: 'DSP-809', subject: 'Equipment Damaged on Return', status: 'open', reporter: 'United Rentals', relatedJob: 'JOB-902' },
        { id: 'DSP-810', subject: 'Late Return without Extension', status: 'resolved', reporter: 'BuildCorp LLC', relatedJob: 'JOB-905' }
    ];

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-primary" /> Dispute Resolution
                    </h1>
                    <p className="text-muted">Manage and resolve conflicts between contractors and suppliers.</p>
                </div>
            </div>

            <div className="bg-surface border border-subtle rounded-3xl p-8 text-center shadow-theme-sm mt-8">
                <AlertCircle className="w-12 h-12 text-accent-warning mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Platform Disputes API Pending</h3>
                <p className="text-muted max-w-lg mx-auto">
                    The dispute resolution module is currently utilizing mock data as backend endpoints (`/disputes`) are not yet available in the OpenAPI specification.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {disputes.map(dispute => (
                    <div key={dispute.id} className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold font-mono text-muted bg-surface-hover px-2 py-1 rounded">{dispute.id}</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border ${dispute.status === 'open' ? 'bg-accent-warning/10 text-accent-warning border-accent-warning/20' :
                                    'bg-accent-success/10 text-accent-success border-accent-success/20'
                                }`}>
                                {dispute.status === 'open' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                {dispute.status.toUpperCase()}
                            </span>
                        </div>
                        <h4 className="font-bold text-main mb-2 truncate">{dispute.subject}</h4>
                        <div className="text-sm text-muted space-y-1">
                            <p>Reporter: <span className="text-main">{dispute.reporter}</span></p>
                            <p>Job Ref: <span className="font-mono text-primary">{dispute.relatedJob}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
