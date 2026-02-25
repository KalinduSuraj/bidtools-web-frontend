'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Shield, Calendar, Activity, Loader2, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { UsersAPI } from '@/lib/api/users.api';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const { data: userData } = await UsersAPI.getUserById(params.userId);
                setUser(userData);

                try {
                    const { data: profileData } = await ProfilesAPI.getProfileByUserId(params.userId);
                    setProfile(profileData);
                } catch {
                    // Profile may not exist yet
                }
            } catch (err: any) {
                console.error('Failed to load user:', err);
                setError(err.response?.data?.message || 'Failed to load user details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [params.userId]);

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to change this user's status to "${newStatus}"?`)) return;
        setIsUpdating(true);
        try {
            const { data } = await UsersAPI.updateUserStatus(params.userId, newStatus);
            setUser(data);
        } catch (err: any) {
            console.error('Failed to update status:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <LoadingWindow fullScreen message="Loading user details..." />;

    if (error) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <ErrorWindow message={error} />
                <Link href="/admin/users" className="mt-4 inline-block text-primary hover:underline">&larr; Back to Users</Link>
            </div>
        );
    }

    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
        active: { color: 'bg-accent-success/10 text-accent-success border-accent-success/20', icon: <CheckCircle2 className="w-4 h-4" /> },
        suspended: { color: 'bg-accent-danger/10 text-accent-danger border-accent-danger/20', icon: <XCircle className="w-4 h-4" /> },
        inactive: { color: 'bg-surface-hover text-muted border-subtle', icon: <Clock className="w-4 h-4" /> },
        pending_verification: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: <AlertTriangle className="w-4 h-4" /> },
    };

    const current = statusConfig[user?.status] || statusConfig.inactive;

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
            <Link href="/admin/users" className="text-sm text-primary hover:underline flex items-center gap-1 w-fit mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Users
            </Link>

            {/* User Header */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-main">{user?.name}</h1>
                            <p className="text-muted flex items-center gap-2">
                                <Mail className="w-4 h-4" /> {user?.email}
                            </p>
                        </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${current.color}`}>
                        {current.icon} {user?.status?.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Info */}
                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 border-b border-subtle pb-3">
                        <User className="w-5 h-5 text-muted" /> Account Information
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">User ID</span>
                            <span className="text-sm font-mono text-main">{user?.user_id?.split('-')[0]}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">Role</span>
                            <span className="text-sm font-bold text-primary capitalize">{user?.role?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-subtle/50">
                            <span className="text-sm text-muted">Joined</span>
                            <span className="text-sm text-main flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {new Date(user?.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Business Profile */}
                <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 border-b border-subtle pb-3">
                        <Shield className="w-5 h-5 text-muted" /> Business Profile
                    </h3>

                    {profile ? (
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-subtle/50">
                                <span className="text-sm text-muted">Company</span>
                                <span className="text-sm font-semibold text-main">{profile.company_name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-subtle/50">
                                <span className="text-sm text-muted">Contact</span>
                                <span className="text-sm text-main">{profile.contact_number}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-subtle/50">
                                <span className="text-sm text-muted">Address</span>
                                <span className="text-sm text-main">{profile.address}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-muted">Verification</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${profile.verification_status === 'verified'
                                    ? 'bg-accent-success/10 text-accent-success'
                                    : profile.verification_status === 'rejected'
                                        ? 'bg-accent-danger/10 text-accent-danger'
                                        : 'bg-orange-500/10 text-orange-500'
                                    }`}>
                                    {profile.verification_status}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted text-sm py-4 text-center">No business profile submitted yet.</p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm mt-6">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b border-subtle pb-3 mb-4">
                    <Activity className="w-5 h-5 text-muted" /> Account Actions
                </h3>

                <div className="flex flex-wrap gap-3">
                    {user?.status !== 'active' && (
                        <button
                            onClick={() => handleStatusChange('active')}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-accent-success/10 hover:bg-accent-success/20 text-accent-success border border-accent-success/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Activate
                        </button>
                    )}
                    {user?.status !== 'suspended' && (
                        <button
                            onClick={() => handleStatusChange('suspended')}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger border border-accent-danger/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Suspend
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
