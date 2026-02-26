'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Users, Globe, Target, Award, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const features = [
    {
        icon: Zap,
        title: 'Real-Time Bidding',
        description: 'Place and manage bids on equipment in real time. Our live bidding engine ensures you never miss an opportunity.',
    },
    {
        icon: Shield,
        title: 'Secure Transactions',
        description: 'Industry-standard security protects every transaction. Payments are processed safely through our verified system.',
    },
    {
        icon: Globe,
        title: 'Nationwide Reach',
        description: 'Connect with contractors and suppliers across Sri Lanka. Find equipment wherever your projects take you.',
    },
    {
        icon: Users,
        title: 'Verified Community',
        description: 'Every user on BidTools goes through a verification process to ensure quality and trustworthiness.',
    },
    {
        icon: Target,
        title: 'Smart Matching',
        description: 'Our intelligent system matches equipment requests with the best available suppliers based on location and price.',
    },
    {
        icon: Award,
        title: 'Best Rates Guaranteed',
        description: 'Competitive bidding ensures you always get the best market rates for renting construction equipment.',
    },
];

const stats = [
    { value: '500+', label: 'Active Users' },
    { value: '1,200+', label: 'Completed Rentals' },
    { value: 'LKR 50M+', label: 'Transaction Volume' },
    { value: '98%', label: 'Satisfaction Rate' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-base text-main flex flex-col transition-colors duration-300">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-glow blur-[120px] opacity-70" />
                </div>
                <div className="container mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl lg:text-6xl font-bold tracking-tight mb-6"
                    >
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-danger">BidTools</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-muted max-w-2xl mx-auto leading-relaxed"
                    >
                        We&apos;re revolutionizing how construction professionals manage equipment rentals
                        in Sri Lanka through technology-driven bidding and smart marketplace solutions.
                    </motion.p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 bg-surface/30">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-muted leading-relaxed mb-4">
                                BidTools was created to solve a real problem in Sri Lanka&apos;s construction industry &mdash;
                                the lack of a transparent, efficient marketplace for equipment rentals.
                            </p>
                            <p className="text-muted leading-relaxed mb-4">
                                Contractors often struggle to find the right equipment at fair prices, while
                                suppliers have idle inventory that could be put to productive use. Our platform
                                bridges this gap.
                            </p>
                            <p className="text-muted leading-relaxed">
                                We leverage competitive bidding, real-time notifications, and location-based
                                matching to create a win-win marketplace for everyone involved.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="bg-surface border border-subtle rounded-2xl p-6 text-center shadow-theme-sm"
                                >
                                    <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
                                    <p className="text-sm text-muted font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-4">Why Choose BidTools?</h2>
                        <p className="text-muted max-w-xl mx-auto">
                            Built with cutting-edge technology to deliver the best equipment rental experience.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.08 }}
                                    className="bg-surface border border-subtle rounded-2xl p-6 shadow-theme-sm hover:shadow-theme-lg hover:border-primary/30 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-surface/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted max-w-xl mx-auto">
                            Getting started with BidTools is simple — whether you&apos;re a contractor or a supplier.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        {/* Contractor Flow */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold">Contractor</span>
                            </h3>
                            <div className="space-y-5">
                                {[
                                    'Create a job request with your equipment needs',
                                    'Receive bids from verified suppliers',
                                    'Compare offers and accept the best bid',
                                    'Manage rentals and make payments securely',
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-accent-success mt-0.5 flex-shrink-0" />
                                        <p className="text-muted">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Supplier Flow */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-accent-success/10 text-accent-success text-sm font-bold">Supplier</span>
                            </h3>
                            <div className="space-y-5">
                                {[
                                    'List your equipment with pricing and details',
                                    'Browse active job requests from contractors',
                                    'Place competitive bids on matching jobs',
                                    'Get notified when your bid is accepted',
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-accent-success mt-0.5 flex-shrink-0" />
                                        <p className="text-muted">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Team / Contact */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
                        <p className="text-muted max-w-xl mx-auto mb-8">
                            Have questions or feedback? We&apos;d love to hear from you. Our team is dedicated
                            to making BidTools the best platform for construction equipment rentals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:support@bidtools.lk"
                                className="px-8 py-4 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-all shadow-theme-lg"
                            >
                                Email Us
                            </a>
                            <a
                                href="tel:+94112345678"
                                className="px-8 py-4 rounded-full border border-subtle text-main font-semibold hover:bg-surface-hover transition-all"
                            >
                                Call +94 11 234 5678
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
