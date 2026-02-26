'use client';

import { Zap, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-subtle bg-surface/60 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-danger shadow-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">BidTools</span>
                        </Link>
                        <p className="text-sm text-muted leading-relaxed">
                            The premier equipment rental bidding platform connecting contractors with suppliers across Sri Lanka.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-muted">Quick Links</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/" className="text-sm text-muted hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/about" className="text-sm text-muted hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/explore" className="text-sm text-muted hover:text-primary transition-colors">Explore</Link></li>
                            <li><Link href="/register" className="text-sm text-muted hover:text-primary transition-colors">Register</Link></li>
                        </ul>
                    </div>

                    {/* For Users */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-muted">For Users</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/register" className="text-sm text-muted hover:text-primary transition-colors">Contractors</Link></li>
                            <li><Link href="/register" className="text-sm text-muted hover:text-primary transition-colors">Suppliers</Link></li>
                            <li><Link href="/login" className="text-sm text-muted hover:text-primary transition-colors">Sign In</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-muted">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-muted">
                                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                support@bidtools.lk
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted">
                                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                +94 11 234 5678
                            </li>
                            <li className="flex items-start gap-2 text-sm text-muted">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                Colombo, Sri Lanka
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-subtle flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted">&copy; {new Date().getFullYear()} BidTools. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/about" className="text-xs text-muted hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/about" className="text-xs text-muted hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
