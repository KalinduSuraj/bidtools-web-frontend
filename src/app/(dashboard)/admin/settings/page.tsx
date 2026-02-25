'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Globe, Palette, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function AdminSettingsPage() {
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        platformName: 'BidTools',
        maintenanceMode: false,
        emailNotifications: true,
        autoApproveVerified: false,
        maxBidDuration: '7',
        platformFeePercent: '5',
        defaultCurrency: 'USD',
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        addToast('Settings saved successfully', 'success');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="border-b border-subtle pb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" /> Platform Settings
                </h1>
                <p className="text-muted">Configure global platform behavior and preferences.</p>
            </div>

            {/* General Settings */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-muted" /> General
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted">Platform Name</label>
                        <input
                            type="text"
                            value={settings.platformName}
                            onChange={(e) => setSettings(s => ({ ...s, platformName: e.target.value }))}
                            className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-1 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted">Default Currency</label>
                        <select
                            value={settings.defaultCurrency}
                            onChange={(e) => setSettings(s => ({ ...s, defaultCurrency: e.target.value }))}
                            className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-1 focus:border-primary transition-all text-sm"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="LKR">LKR (Rs)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted">Platform Fee (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={settings.platformFeePercent}
                            onChange={(e) => setSettings(s => ({ ...s, platformFeePercent: e.target.value }))}
                            className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-1 focus:border-primary transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted">Max Bid Duration (days)</label>
                        <input
                            type="number"
                            min="1"
                            value={settings.maxBidDuration}
                            onChange={(e) => setSettings(s => ({ ...s, maxBidDuration: e.target.value }))}
                            className="w-full bg-base border border-subtle text-main rounded-xl py-3 px-4 focus:ring-1 focus:border-primary transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Security & Access */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-muted" /> Security & Access
                </h3>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-xl border border-subtle bg-base hover:bg-surface-hover/50 cursor-pointer transition-colors">
                        <div>
                            <p className="font-semibold text-main">Maintenance Mode</p>
                            <p className="text-sm text-muted">Temporarily disable platform access for non-admin users.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl border border-subtle bg-base hover:bg-surface-hover/50 cursor-pointer transition-colors">
                        <div>
                            <p className="font-semibold text-main">Auto-Approve Verified Profiles</p>
                            <p className="text-sm text-muted">Automatically approve profiles that pass document verification.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.autoApproveVerified}
                            onChange={(e) => setSettings(s => ({ ...s, autoApproveVerified: e.target.checked }))}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                    </label>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-muted" /> Notifications
                </h3>

                <label className="flex items-center justify-between p-4 rounded-xl border border-subtle bg-base hover:bg-surface-hover/50 cursor-pointer transition-colors">
                    <div>
                        <p className="font-semibold text-main">Email Notifications</p>
                        <p className="text-sm text-muted">Send email alerts for critical platform events.</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings(s => ({ ...s, emailNotifications: e.target.checked }))}
                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-theme-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
