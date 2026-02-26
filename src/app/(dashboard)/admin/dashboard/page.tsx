'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, Users, Briefcase, Zap, CheckCircle, Clock } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, PieChart, Pie, Cell
} from 'recharts';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { PaymentsAPI } from '@/lib/api/payments.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';

// Analytics Mock Data for Charts (Time series APIs pending)
const revenueData = [
    { name: 'Mon', revenue: 4000, bids: 2400 },
    { name: 'Tue', revenue: 3000, bids: 1398 },
    { name: 'Wed', revenue: 2000, bids: 9800 },
    { name: 'Thu', revenue: 2780, bids: 3908 },
    { name: 'Fri', revenue: 1890, bids: 4800 },
    { name: 'Sat', revenue: 2390, bids: 3800 },
    { name: 'Sun', revenue: 3490, bids: 4300 },
];

const categoryData = [
    { name: 'Earthmoving', value: 400 },
    { name: 'Aerial Lifts', value: 300 },
    { name: 'Power Gen', value: 300 },
    { name: 'Material Handling', value: 200 },
];

const COLORS = ['#F7C873', '#FAEBCD', '#E8A540', '#6B7280'];

export default function AdminAnalyticsDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        verifiedSuppliers: 0,
        pendingSuppliers: [] as any[]
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch profiles to find suppliers
                const { data: profiles } = await ProfilesAPI.getProfiles({ profile_type: 'supplier' });

                // Fetch payments to calculate volume
                const { data: payments } = await PaymentsAPI.getPayments();

                const totalRevenue = payments.reduce((acc: number, payment: any) => acc + (payment.amount || 0), 0);
                const verifiedSuppliers = profiles.filter((p: any) => p.verification_status === 'verified').length;
                const pendingSuppliers = profiles.filter((p: any) => p.verification_status === 'pending');

                setStats({
                    revenue: totalRevenue,
                    verifiedSuppliers,
                    pendingSuppliers
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleVerification = async (profileId: string, status: string) => {
        try {
            await ProfilesAPI.updateVerificationStatus(profileId, status as any);
            // Remove from the pending queue visually
            setStats(prev => ({
                ...prev,
                verifiedSuppliers: status === 'verified' ? prev.verifiedSuppliers + 1 : prev.verifiedSuppliers,
                pendingSuppliers: prev.pendingSuppliers.filter(p => p.profile_id !== profileId)
            }));
            alert(`Supplier successfully ${status === 'verified' ? 'approved' : 'rejected'}.`);
        } catch (error: any) {
            console.error('Verification failed:', error);
            alert(error.response?.data?.message || 'Failed to update verification status.');
        }
    };

    if (isLoading) {
        return (
            <LoadingWindow
                fullScreen
                message="Loading Analytics..."
                submessage="Loading analytics and live data..."
            />
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
                        <span className="px-2 py-0.5 rounded-full bg-accent-danger/10 text-accent-danger text-xs font-bold border border-accent-danger/20">Admin Access</span>
                    </div>
                    <p className="text-muted">Global overview of platform revenue, active users, and system health.</p>
                </div>

                <button className="px-6 py-3 bg-surface hover:bg-surface-hover text-main rounded-xl font-medium border border-subtle shadow-theme-sm transition-all flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Generate Report
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: DollarSign, label: 'Gross Volume (All Time)', value: `$${(stats.revenue / 1000).toFixed(1)}k`, trend: 'Live API Data', color: 'text-accent-success', bg: 'bg-accent-success/10' },
                    { icon: Zap, label: 'Active Auctions', value: '3,492', trend: '+8.2%', color: 'text-primary', bg: 'bg-primary/10' },
                    { icon: Users, label: 'Verified Suppliers', value: stats.verifiedSuppliers.toString(), trend: 'Live API Data', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { icon: Briefcase, label: 'Completed Jobs', value: '18.4k', trend: '+24%', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ].map((kpi, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={kpi.label}
                        className="p-5 rounded-2xl bg-surface border border-subtle relative overflow-hidden group shadow-theme-sm"
                    >
                        <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full ${kpi.bg} blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                        <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} w-fit mb-4`}>
                            <kpi.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{kpi.value}</h3>
                        <p className="text-sm text-main font-medium">{kpi.label}</p>
                        <p className="text-xs text-muted mt-1">{kpi.trend}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">

                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-subtle shadow-theme-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Revenue & Bid Volume Trends</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F7C873" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#F7C873" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--color-text-main)' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" stroke="#F7C873" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="bids" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBids)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="lg:col-span-1 p-6 rounded-2xl bg-surface border border-subtle shadow-theme-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Equipment Categories</h3>
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Verification Queue Preview */}
            <div className="mt-6 p-6 rounded-2xl bg-surface border border-subtle shadow-theme-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Pending Supplier Verifications ({stats.pendingSuppliers.length})</h3>
                    {stats.pendingSuppliers.length > 0 && <button className="text-sm text-primary font-medium hover:underline">View Queue</button>}
                </div>

                <div className="overflow-x-auto">
                    {stats.pendingSuppliers.length === 0 ? (
                        <div className="text-center py-8 text-muted border-2 border-dashed border-subtle rounded-xl">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent-success opacity-50" />
                            <p>No pending verifications. You're all caught up!</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted">
                                    <th className="pb-3 font-medium">Company Name</th>
                                    <th className="pb-3 font-medium">Profile ID</th>
                                    <th className="pb-3 font-medium">Submitted</th>
                                    <th className="pb-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-subtle">
                                {stats.pendingSuppliers.map((profile) => (
                                    <tr key={profile.profile_id} className="hover:bg-surface-hover/30 transition-colors">
                                        <td className="py-3 font-medium text-main">{profile.company_name || 'Unnamed Company'}</td>
                                        <td className="py-3 text-sm text-muted font-mono">{profile.profile_id}</td>
                                        <td className="py-3 text-sm text-muted">{new Date(profile.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 text-right">
                                            <button
                                                onClick={() => handleVerification(profile.profile_id, 'verified')}
                                                className="px-3 py-1.5 bg-accent-success/10 text-accent-success hover:bg-accent-success hover:text-white rounded-lg text-xs font-bold transition-colors mr-2"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerification(profile.profile_id, 'rejected')}
                                                className="px-3 py-1.5 bg-accent-danger/10 text-accent-danger hover:bg-accent-danger hover:text-white rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Deny
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
}
