'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { PaymentsAPI } from '@/lib/api/payments.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';

const revenueData = [
    { name: 'Jan', revenue: 12000, transactions: 45 },
    { name: 'Feb', revenue: 19000, transactions: 72 },
    { name: 'Mar', revenue: 15000, transactions: 58 },
    { name: 'Apr', revenue: 22000, transactions: 89 },
    { name: 'May', revenue: 28000, transactions: 110 },
    { name: 'Jun', revenue: 25000, transactions: 95 },
];

const categoryData = [
    { name: 'Earthmoving', value: 400, color: '#3b82f6' },
    { name: 'Aerial Lifts', value: 300, color: '#10b981' },
    { name: 'Power Gen', value: 250, color: '#f59e0b' },
    { name: 'Material Handling', value: 200, color: '#8b5cf6' },
    { name: 'Compaction', value: 150, color: '#ef4444' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function AdminAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        activeListings: 0,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [profilesRes, paymentsRes] = await Promise.all([
                    ProfilesAPI.getProfiles(),
                    PaymentsAPI.getPayments(),
                ]);

                const profiles = Array.isArray(profilesRes.data) ? profilesRes.data : [];
                const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

                setStats({
                    totalUsers: profiles.length,
                    totalRevenue: payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
                    totalTransactions: payments.length,
                    activeListings: 0,
                });
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) return <LoadingWindow fullScreen message="Loading analytics dashboard..." />;

    const kpiCards = [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10', change: '+8.2%', up: true },
        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-accent-success', bg: 'bg-accent-success/10', change: '+12.5%', up: true },
        { label: 'Transactions', value: stats.totalTransactions.toLocaleString(), icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10', change: '+5.1%', up: true },
        { label: 'Active Listings', value: stats.activeListings.toLocaleString(), icon: Package, color: 'text-orange-500', bg: 'bg-orange-500/10', change: '-2.3%', up: false },
    ];

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="border-b border-subtle pb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-primary" /> Platform Analytics
                </h1>
                <p className="text-muted">Comprehensive overview of platform performance and growth metrics.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">{card.label}</h3>
                        </div>
                        <p className="text-3xl font-black text-main">{card.value}</p>
                        <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${card.up ? 'text-accent-success' : 'text-accent-danger'}`}>
                            {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {card.change} vs last month
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                    <h3 className="font-bold text-lg mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                            <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                            <YAxis stroke="var(--color-text-muted)" />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                            <Area type="monotone" dataKey="transactions" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                    <h3 className="font-bold text-lg mb-4">Equipment Categories</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                {categoryData.map((entry, index) => (
                                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Bar Chart */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                <h3 className="font-bold text-lg mb-4">Monthly Transactions vs Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                        <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                        <YAxis stroke="var(--color-text-muted)" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="transactions" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
