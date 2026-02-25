'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Package,
    Users,
    Settings,
    LogOut,
    Zap,
    Activity,
    Map,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const role = user?.role?.name || 'contractor';

    const contractorLinks = [
        { name: 'Overview', href: '/contractor/dashboard', icon: LayoutDashboard },
        { name: 'Requests', href: '/contractor/requests', icon: FileText },
        { name: 'Rentals', href: '/contractor/rentals', icon: Package },
        { name: 'Map View', href: '/contractor/map', icon: Map },
    ];

    const supplierLinks = [
        { name: 'Overview', href: '/supplier/dashboard', icon: LayoutDashboard },
        { name: 'Job Feed', href: '/supplier/feed', icon: Activity },
        { name: 'Inventory', href: '/supplier/inventory', icon: Package },
        { name: 'Orders', href: '/supplier/orders', icon: FileText },
    ];

    const adminLinks = [
        { name: 'Analytics', href: '/admin/dashboard', icon: Activity },
        { name: 'Live Monitor', href: '/admin/monitor', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Disputes', href: '/admin/disputes', icon: MessageSquare },
    ];

    const links = role === 'admin' ? adminLinks : role === 'supplier' ? supplierLinks : contractorLinks;

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-base/80 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: isOpen ? 0 : -300 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="fixed top-0 left-0 h-screen w-64 bg-surface/90 backdrop-blur-xl border-r border-subtle z-50 flex flex-col lg:translate-x-0 transition-transform"
            >
                <div className="h-20 flex items-center px-6 border-b border-subtle">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-danger shadow-[0_0_15px_var(--color-primary-glow)] flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">BidTools</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${isActive
                                        ? 'text-primary font-bold bg-primary/10 shadow-[inset_2px_0_0_var(--color-primary)]'
                                        : 'text-muted hover:text-main hover:bg-surface-hover'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary drop-shadow-[0_0_8px_var(--color-primary)]' : ''}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-subtle">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-base border border-subtle">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">{(user?.name || 'User').charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.name || 'Guest User'}</p>
                            <p className="text-xs text-muted truncate capitalize">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-muted hover:text-accent-danger hover:bg-accent-danger/10 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
