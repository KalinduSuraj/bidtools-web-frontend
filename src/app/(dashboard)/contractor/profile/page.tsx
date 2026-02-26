'use client';

import { useState, useEffect } from 'react';
import { User, Building2, Phone, MapPin, FileText, Save, Loader2, Shield, Camera, Edit, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfilesAPI } from '@/lib/api/profiles.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';


export default function ContractorProfilePage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        company_name: '',
        contact_number: '',
        address: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.user_id) return;
            try {
                const { data } = await ProfilesAPI.getProfileByUserId(user.user_id);
                const profileData = Array.isArray(data) ? data[0] : data;
                setProfile(profileData || null);
                if (profileData) {
                    setFormData({
                        company_name: profileData.company_name || '',
                        contact_number: profileData.contact_number || '',
                        address: profileData.address || '',
                    });
                }
            } catch (err) {
                console.log('No profile found yet');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user?.user_id]);

    const handleSave = async () => {
        if (!user?.user_id) return;
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            if (profile?.profile_id) {
                // Update existing profile
                const { data } = await ProfilesAPI.updateProfile(profile.profile_id, formData);
                setProfile(data);
            } else {
                // Create new profile
                const { data } = await ProfilesAPI.createProfile({
                    user_id: user.user_id,
                    profile_type: 'contractor',
                    ...formData,
                });
                setProfile(data);
            }
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            setSaveError(err.response?.data?.message || 'Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSaveError(null);
        setFormData({
            company_name: profile?.company_name || '',
            contact_number: profile?.contact_number || '',
            address: profile?.address || '',
        });
    };

    if (isLoading) return <LoadingWindow fullScreen message="Loading profile..." />;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <User className="w-8 h-8 text-primary" /> My Profile
                    </h1>
                    <p className="text-muted">Manage your contractor profile and business information.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-theme-sm hover:bg-primary-hover transition-colors flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-accent-success text-white rounded-xl text-sm font-bold shadow-theme-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {saveSuccess && (
                <div className="p-4 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success flex items-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">Profile updated successfully!</p>
                </div>
            )}

            {saveError && (
                <div className="p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger flex items-center gap-3 animate-in fade-in duration-300">
                    <X className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{saveError}</p>
                </div>
            )}

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
                        {isEditing ? (
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                    placeholder="Enter company name"
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-base border border-subtle rounded-xl py-3 px-4">
                                <Building2 className="w-4 h-4 text-muted" />
                                <span className="text-main text-sm">{profile?.company_name || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted">Contact Number</label>
                        {isEditing ? (
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input
                                    type="tel"
                                    value={formData.contact_number}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                                    placeholder="Enter contact number"
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-base border border-subtle rounded-xl py-3 px-4">
                                <Phone className="w-4 h-4 text-muted" />
                                <span className="text-main text-sm">{profile?.contact_number || 'Not set'}</span>
                            </div>
                        )}
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-muted">Address</label>
                        {isEditing ? (
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted" />
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Enter business address"
                                    rows={3}
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-base border border-subtle rounded-xl py-3 px-4">
                                <MapPin className="w-4 h-4 text-muted" />
                                <span className="text-main text-sm">{profile?.address || 'Not set'}</span>
                            </div>
                        )}
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
                    <span className="text-sm font-bold text-primary capitalize">{typeof user?.role === 'object' ? user?.role?.name : user?.role}</span>
                </div>
                <div className="flex justify-between py-2">
                    <span className="text-sm text-muted">Member Since</span>
                    <span className="text-sm text-main">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
}
