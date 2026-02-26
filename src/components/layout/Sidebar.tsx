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
    DollarSign,
    ShieldCheck,
    BarChart3,
    Cpu,
    MessageSquare,
    Bell,
    User,
    CreditCard,
    ShoppingCart,
    Crosshair,
    Gavel
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavLink {
    name: string;
    href: string;
    icon: any;
    section?: string;
}

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const role = user?.role?.name || 'contractor';

    const contractorLinks: NavLink[] = [
        { name: 'Overview', href: '/contractor/dashboard', icon: LayoutDashboard, section: 'Main' },
        { name: 'New Request', href: '/contractor/requests/new', icon: FileText, section: 'Main' },
        { name: 'Bid Management', href: '/contractor/bids', icon: Gavel, section: 'Main' },
        { name: 'Rentals', href: '/contractor/rentals', icon: Package, section: 'Main' },
        { name: 'Payments', href: '/contractor/payments', icon: CreditCard, section: 'Account' },
        { name: 'Notifications', href: '/contractor/notifications', icon: Bell, section: 'Account' },
        { name: 'Profile', href: '/contractor/profile', icon: User, section: 'Account' },
    ];

    const supplierLinks: NavLink[] = [
        { name: 'Overview', href: '/supplier/dashboard', icon: LayoutDashboard, section: 'Main' },
        { name: 'Request Feed', href: '/supplier/request-feed', icon: Crosshair, section: 'Main' },
        { name: 'Inventory', href: '/supplier/inventory', icon: Package, section: 'Main' },
        { name: 'Orders', href: '/supplier/orders', icon: ShoppingCart, section: 'Main' },
        { name: 'Notifications', href: '/supplier/notifications', icon: Bell, section: 'Account' },
        { name: 'Profile', href: '/supplier/profile', icon: User, section: 'Account' },
    ];

    const adminLinks: NavLink[] = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, section: 'Overview' },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, section: 'Overview' },
        { name: 'Live Monitor', href: '/admin/monitor', icon: Activity, section: 'Operations' },
        { name: 'Users', href: '/admin/users', icon: Users, section: 'Operations' },
        { name: 'Verifications', href: '/admin/verifications', icon: ShieldCheck, section: 'Operations' },
        { name: 'Listings', href: '/admin/listings', icon: Package, section: 'Operations' },
        { name: 'Finance', href: '/admin/finance', icon: DollarSign, section: 'Operations' },
        { name: 'Disputes', href: '/admin/disputes', icon: MessageSquare, section: 'Management' },
        { name: 'ML Ops', href: '/admin/ml-ops', icon: Cpu, section: 'Management' },
        { name: 'Settings', href: '/admin/settings', icon: Settings, section: 'Management' },
    ];

    const links = role === 'admin' ? adminLinks : role === 'supplier' ? supplierLinks : contractorLinks;

    // Group links by section
    const sections = links.reduce((acc, link) => {
        const section = link.section || 'Main';
        if (!acc[section]) acc[section] = [];
        acc[section].push(link);
        return acc;
    }, {} as Record<string, NavLink[]>);

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-base/80 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-surface/90 backdrop-blur-xl border-r border-subtle z-50 flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <div className="h-20 flex items-center px-6 border-b border-subtle">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-danger shadow-[0_0_15px_var(--color-primary-glow)] flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">BidTools</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto scrollbar-thin">
                    {Object.entries(sections).map(([sectionName, sectionLinks]) => (
                        <div key={sectionName}>
                            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted/60">{sectionName}</p>
                            <div className="space-y-0.5">
                                {sectionLinks.map((link) => {
                                    const isActive = pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== `/${role}/dashboard`);
                                    const Icon = link.icon;

                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative text-sm ${isActive
                                                ? 'text-primary font-bold bg-primary/10 shadow-[inset_2px_0_0_var(--color-primary)]'
                                                : 'text-muted hover:text-main hover:bg-surface-hover'
                                            }`}
                                        >
                                            <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary drop-shadow-[0_0_8px_var(--color-primary)]' : ''}`} />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
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
            </aside>
        </>
    );
}
