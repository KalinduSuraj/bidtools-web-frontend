'use client';

import { useState, useEffect } from 'react';
import { User, Building2, Phone, MapPin, FileText, Save, Loader2, Shield, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';


export default function ContractorProfilePage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.user_id) return;
            try {
                const { data } = await ProfilesAPI.getProfileByUserId(user.user_id);
                setProfile(data);
            } catch (err) {
                console.log('No profile found yet');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user?.user_id]);

    if (isLoading) return <LoadingWindow fullScreen message="Loading profile..." />;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="border-b border-subtle pb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                    <User className="w-8 h-8 text-primary" /> My Profile
                </h1>
                <p className="text-muted">Manage your contractor profile and business information.</p>
            </div>

            {/* Profile Header */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-black">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-theme-sm hover:bg-primary-hover transition-colors">
                            <Camera className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-main">{user?.name}</h2>
                        <p className="text-muted text-sm">{user?.email}</p>
                        <span className={`mt-2 inline-block text-xs font-bold px-2.5 py-1 rounded-lg ${profile?.verification_status === 'verified'
                            ? 'bg-accent-success/10 text-accent-success'
                            : 'bg-orange-500/10 text-orange-500'
                            }`}>
                            <Shield className="w-3 h-3 inline mr-1" />
                            {profile?.verification_status || 'Not Verified'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Business Info */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-5">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b border-subtle pb-3">
                    <Building2 className="w-5 h-5 text-muted" /> Business Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted">Company Name</label>
                        <div className="flex items-center gap-2 bg-base border border-subtle rounded-xl py-3 px-4">
                            <Building2 className="w-4 h-4 text-muted" />
                            <span className="text-main text-sm">{profile?.company_name || 'Not set'}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted">Contact Number</label>
                        <div className="flex items-center gap-2 bg-base border border-subtle rounded-xl py-3 px-4">
                            <Phone className="w-4 h-4 text-muted" />
                            <span className="text-main text-sm">{profile?.contact_number || 'Not set'}</span>
                        </div>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-muted">Address</label>
                        <div className="flex items-center gap-2 bg-base border border-subtle rounded-xl py-3 px-4">
                            <MapPin className="w-4 h-4 text-muted" />
                            <span className="text-main text-sm">{profile?.address || 'Not set'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-5">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b border-subtle pb-3">
                    <FileText className="w-5 h-5 text-muted" /> Verification Documents
                </h3>

                {profile?.documents_url ? (
                    <div className="p-4 rounded-xl bg-base border border-subtle">
                        <a href={profile.documents_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" /> View uploaded documents
                        </a>
                    </div>
                ) : (
                    <div className="p-8 text-center border-2 border-dashed border-subtle rounded-xl bg-surface-hover/30">
                        <FileText className="w-10 h-10 text-muted mx-auto mb-3" />
                        <p className="text-muted text-sm mb-4">No documents uploaded yet. Upload your business verification documents.</p>
                        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-theme-sm hover:bg-primary-hover transition-colors">
                            Upload Documents
                        </button>
                    </div>
                )}
            </div>

            {/* Account Info */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b border-subtle pb-3 mb-2">
                    Account Details
                </h3>
                <div className="flex justify-between py-2 border-b border-subtle/50">
                    <span className="text-sm text-muted">User ID</span>
                    <span className="text-sm font-mono text-main">{user?.user_id?.split('-')[0]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle/50">
                    <span className="text-sm text-muted">Role</span>
                    <span className="text-sm font-bold text-primary capitalize">{user?.role?.name}</span>
                </div>
                <div className="flex justify-between py-2">
                    <span className="text-sm text-muted">Member Since</span>
                    <span className="text-sm text-main">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
}
