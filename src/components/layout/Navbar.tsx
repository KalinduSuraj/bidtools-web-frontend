'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Moon, Sun, Menu, X, Compass, Briefcase, Package, Info, Home } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Jobs', href: '/#jobs', icon: Briefcase },
    { label: 'Equipment', href: '/#items', icon: Package },
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'About', href: '/about', icon: Info },
];

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > 20);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const getDashboardUrl = () => {
        const role = typeof user?.role === 'object' ? user?.role?.name : user?.role;
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'supplier') return '/supplier/dashboard';
        return '/contractor/dashboard';
    };

    const isActive = (href: string) => {
        if (!mounted) return false; // Avoid hydration mismatch
        if (href.includes('#')) return pathname === '/';
        return pathname === href;
    };

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                    scrolled
                        ? 'bg-surface/40 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
                        : 'bg-transparent backdrop-blur-sm border-b border-transparent'
                }`}
            >
                {/* Glassmorphism top edge highlight */}
                <div className={`absolute inset-x-0 top-0 h-px transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                <div className="container mx-auto px-6 h-18 flex items-center justify-between py-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent-danger shadow-lg flex items-center justify-center group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
                            <Zap className="w-5 h-5 text-white" />
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent-danger opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-main to-muted bg-clip-text group-hover:from-primary group-hover:to-accent-danger group-hover:text-transparent transition-all duration-300">
                            BidTools
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center">
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-surface/30 backdrop-blur-lg border border-white/[0.06]">
                            {navLinks.map(link => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                            active
                                                ? 'text-primary bg-primary/10'
                                                : 'text-muted hover:text-main hover:bg-surface/50'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {link.label}
                                        {active && (
                                            <motion.div
                                                layoutId="navIndicator"
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary"
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="relative p-2.5 rounded-xl bg-surface/30 backdrop-blur-lg border border-white/[0.06] hover:bg-surface/50 hover:border-white/[0.12] transition-all duration-300 text-muted hover:text-main group"
                            suppressHydrationWarning
                        >
                            {mounted ? (
                                <motion.div
                                    key={theme}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                                </motion.div>
                            ) : (
                                <div className="w-4.5 h-4.5" />
                            )}
                        </button>

                        {isAuthenticated ? (
                            <Link
                                href={getDashboardUrl()}
                                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
                            >
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                    {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                                </div>
                                Dashboard
                            </Link>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-main bg-surface/30 backdrop-blur-lg border border-white/[0.06] hover:bg-surface/50 hover:border-white/[0.12] transition-all duration-300"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
                                >
                                    Join Now
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2.5 rounded-xl bg-surface/30 backdrop-blur-lg border border-white/[0.06] hover:bg-surface/50 transition-all duration-300 text-muted"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mobileOpen ? 'close' : 'menu'}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </motion.div>
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Dropdown - Glassmorphism Panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, y: 0, backdropFilter: 'blur(24px)' }}
                        exit={{ opacity: 0, y: -10, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed top-[72px] inset-x-0 z-40 lg:hidden"
                    >
                        <div className="mx-4 mt-2 rounded-2xl bg-surface/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-4 space-y-1">
                            {navLinks.map((link, i) => {
                                const Icon = link.icon;
                                return (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                isActive(link.href)
                                                    ? 'text-primary bg-primary/10'
                                                    : 'text-muted hover:text-main hover:bg-surface/50'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                            <div className="pt-3 mt-2 border-t border-white/[0.06] space-y-2">
                                {isAuthenticated ? (
                                    <Link
                                        href={getDashboardUrl()}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-semibold text-sm border border-white/10"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="block w-full text-center py-3 rounded-xl bg-surface/40 border border-white/[0.06] text-main font-semibold text-sm"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setMobileOpen(false)}
                                            className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-semibold text-sm border border-white/10"
                                        >
                                            Join Now
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
