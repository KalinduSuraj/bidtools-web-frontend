'use client';

import { useState, useEffect } from 'react';
import { Users, Search, MoreVertical, StopCircle, RefreshCw, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsersAPI } from '@/lib/api/users.api';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

interface User {
    user_id: string;
    name: string;
    email: string;
    role: { name: string } | string;
    status: { name: string } | string;
    created_at: string;
}

// Helper to extract string from status/role which can be object or string
const getStatusStr = (status: any): string => typeof status === 'object' ? status?.name : (status || 'inactive');
const getRoleStr = (role: any): string => typeof role === 'object' ? role?.name : (role || 'unknown');

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Filters
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // The OpenAPI spec marks these query params as required
            const { data } = await UsersAPI.getUsers({
                role: roleFilter === 'all' ? undefined : roleFilter,
                status: statusFilter === 'all' ? undefined : statusFilter,
                limit: 100,
                offset: 0
            });
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setUsers([]);
            setError('Failed to load user database. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const toggleMenu = (id: string) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    const handleUpdateStatus = async (userId: string, newStatus: string) => {
        try {
            await UsersAPI.updateUser(userId, { status: newStatus });
            setUsers(users.map(u => u.user_id === userId ? { ...u, status: newStatus as any } : u));
        } catch (err) {
            console.error('Failed to update user status:', err);
            alert('Failed to update status. Please view console for details.');
        } finally {
            setActiveMenu(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const q = searchQuery.toLowerCase();
        return (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.user_id || '').toLowerCase().includes(q);
    });

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-subtle pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" /> User Management
                    </h1>
                    <p className="text-muted">Global oversight of all platform users, contractors, and suppliers.</p>
                </div>

                <button onClick={fetchUsers} className="px-4 py-2 bg-surface hover:bg-surface-hover text-main rounded-xl text-sm font-medium border border-subtle flex items-center gap-2 transition-colors shadow-theme-sm disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-surface border border-subtle shadow-theme-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or ID..."
                        className="w-full bg-base border border-subtle text-main rounded-xl py-2 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-base border border-subtle text-main rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-sm"
                    >
                        <option value="all">All Roles</option>
                        <option value="contractor">Contractors</option>
                        <option value="supplier">Suppliers</option>
                        <option value="admin">Admins</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-base border border-subtle text-main rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="pending_verification">Pending</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface border border-subtle rounded-2xl shadow-theme-sm overflow-hidden overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted bg-surface-hover/50">
                            <th className="p-4 font-medium pl-6">User / Company Details</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Joined Date</th>
                            <th className="p-4 font-medium text-right pr-6">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle relative">
                        {isLoading && users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-0 border-none">
                                    <div className="py-12">
                                        <LoadingWindow message="Loading users..." />
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="p-0 border-none">
                                    <div className="py-12">
                                        <ErrorWindow message={error} />
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted">No users found matching your filters.</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, idx) => (
                                <tr key={user.user_id || idx} className="hover:bg-surface-hover/30 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 border border-subtle shadow-inner font-bold text-white text-sm">
                                                {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-main">{user.name || 'Unnamed User'}</p>
                                                <p className="text-xs text-muted font-mono">{user.email || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-hover border border-subtle uppercase tracking-wider text-muted">
                                            {getRoleStr(user.role)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {(() => { const st = getStatusStr(user.status); return (
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border ${st === 'active' ? 'bg-accent-success/10 text-accent-success border-accent-success/20' :
                                            st === 'pending_verification' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                st === 'suspended' ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20' :
                                                    'bg-surface-hover text-muted border-subtle'
                                            }`}>
                                            {st === 'active' && <ShieldCheck className="w-3.5 h-3.5" />}
                                            {st === 'suspended' && <AlertTriangle className="w-3.5 h-3.5" />}
                                            {st.replace('_', ' ')}
                                        </span>
                                        ); })()}
                                    </td>
                                    <td className="p-4 text-sm text-muted">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right pr-6 relative">
                                        <button
                                            onClick={() => toggleMenu(user.user_id)}
                                            className="p-2 rounded-lg text-muted hover:text-main hover:bg-base border border-transparent hover:border-subtle transition-all"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenu === user.user_id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                <div className="absolute right-8 top-12 w-48 bg-surface border border-subtle rounded-xl shadow-theme-lg z-20 overflow-hidden text-left py-1 animate-in fade-in zoom-in-95 duration-100">
                                                    {getStatusStr(user.status) !== 'active' && (
                                                        <button onClick={() => handleUpdateStatus(user.user_id, 'active')} className="w-full px-4 py-2 text-sm text-accent-success hover:bg-accent-success/10 flex items-center gap-2 transition-colors">
                                                            <ShieldCheck className="w-4 h-4" /> Activate User
                                                        </button>
                                                    )}
                                                    {getStatusStr(user.status) !== 'suspended' && (
                                                        <button onClick={() => handleUpdateStatus(user.user_id, 'suspended')} className="w-full px-4 py-2 text-sm text-accent-danger hover:bg-accent-danger/10 flex items-center gap-2 transition-colors">
                                                            <StopCircle className="w-4 h-4" /> Suspend
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
