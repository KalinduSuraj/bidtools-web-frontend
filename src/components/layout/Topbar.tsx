'use client';

import { useState, useEffect } from 'react';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function Topbar({ isOpen, setIsOpen }: TopbarProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-subtle flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden p-2 rounded-lg text-muted hover:text-main hover:bg-surface-hover transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Global Search */}
                <div className="hidden md:flex relative group w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search universally..."
                        className="w-full bg-base border border-subtle text-main text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-theme-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 relative">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full hover:bg-surface-hover transition-colors text-muted hover:text-main"
                    suppressHydrationWarning
                >
                    {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
                </button>

                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full hover:bg-surface-hover transition-colors text-muted hover:text-main"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent-danger border-2 border-surface animate-pulse" />
                </button>

                <AnimatePresence>
                    {showNotifications && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-80 bg-surface border border-subtle rounded-2xl shadow-theme-lg overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-subtle flex justify-between items-center">
                                <h3 className="font-bold">Notifications</h3>
                                <button className="text-xs text-primary hover:underline">Mark all read</button>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-64 p-2 space-y-1">
                                <div className="p-3 rounded-xl hover:bg-base transition-colors cursor-pointer border border-transparent hover:border-subtle">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-semibold text-main">New Bid Received</span>
                                        <span className="text-xs text-muted">2m ago</span>
                                    </div>
                                    <p className="text-xs text-muted line-clamp-2">Equipment Rentals LLC just placed a bid of $450/day on your Excavator request.</p>
                                </div>
                                <div className="p-3 rounded-xl hover:bg-base transition-colors cursor-pointer border border-transparent hover:border-subtle">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-semibold text-main">Auction Ending</span>
                                        <span className="text-xs text-muted">1h ago</span>
                                    </div>
                                    <p className="text-xs text-muted line-clamp-2">The auction for Request #1402 is ending in 30 minutes! Review your bids.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
