'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Moon, Sun, Lock, Mail, User, Building, Phone, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

type Role = 'contractor' | 'supplier';

export default function RegisterPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedRole, setSelectedRole] = useState<Role>('contractor');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: selectedRole
            });

            // Pass the email to the verify page
            sessionStorage.setItem('verify_email', formData.email);
            router.push('/verify');
        } catch (error: any) {
            console.error('Registration failed:', error);
            alert(error.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base text-main relative flex items-center justify-center p-6 overflow-hidden transition-colors duration-300">
            {/* Background Stylings */}
            <div className="absolute w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-primary-glow blur-[100px] opacity-50" />
                <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[30%] rounded-full bg-accent-success/10 blur-[120px] opacity-40" />
            </div>

            {/* Top Navigation */}
            <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-danger shadow-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden sm:block">BidTools</span>
                </Link>
            </div>

            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full bg-surface hover:bg-surface-hover shadow-theme-sm transition-colors text-muted hover:text-main border border-subtle"
                    suppressHydrationWarning
                >
                    {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
                </button>
            </div>

            {/* Register Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-xl bg-surface/80 backdrop-blur-xl border border-subtle rounded-3xl p-8 sm:p-10 shadow-theme-lg mt-12"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Create an Account</h1>
                    <p className="text-muted text-sm">Join the premier equipment bidding platform.</p>
                </div>

                {step === 1 ? (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h3 className="font-semibold text-lg">I want to join as a:</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedRole('contractor')}
                                className={`relative overflow-hidden p-6 rounded-2xl border-2 text-left transition-all ${selectedRole === 'contractor'
                                    ? 'border-primary bg-primary/5 shadow-theme-sm'
                                    : 'border-subtle bg-base hover:border-primary/50'
                                    }`}
                            >
                                {selectedRole === 'contractor' && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full -z-10" />
                                )}
                                <Building className={`w-8 h-8 mb-4 ${selectedRole === 'contractor' ? 'text-primary' : 'text-muted'}`} />
                                <h4 className="font-bold text-lg mb-1">Contractor</h4>
                                <p className="text-sm text-muted">Post jobs, compare bids, and rent equipment.</p>
                            </button>

                            <button
                                onClick={() => setSelectedRole('supplier')}
                                className={`relative overflow-hidden p-6 rounded-2xl border-2 text-left transition-all ${selectedRole === 'supplier'
                                    ? 'border-accent-success bg-accent-success/5 shadow-theme-sm'
                                    : 'border-subtle bg-base hover:border-accent-success/50'
                                    }`}
                            >
                                {selectedRole === 'supplier' && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-accent-success/10 rounded-bl-full -z-10" />
                                )}
                                <User className={`w-8 h-8 mb-4 ${selectedRole === 'supplier' ? 'text-accent-success' : 'text-muted'}`} />
                                <h4 className="font-bold text-lg mb-1">Supplier</h4>
                                <p className="text-sm text-muted">Manage inventory, submit bids, and earn.</p>
                            </button>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-4 font-semibold shadow-theme-sm transition-all flex items-center justify-center gap-2 group mt-8"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-muted hover:text-main transition-colors flex items-center gap-1"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" /> Back
                            </button>
                            <div className="h-4 w-px bg-subtle"></div>
                            <span className="text-sm font-medium px-2 py-0.5 rounded bg-surface-hover border border-subtle">
                                {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Registration
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text" name="name" required value={formData.name} onChange={handleInputChange}
                                    placeholder="Full Name"
                                    className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pb-3"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email" name="email" required value={formData.email} onChange={handleInputChange}
                                        placeholder="Email Address"
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                                        placeholder="Phone Number"
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password" name="password" required value={formData.password} onChange={handleInputChange}
                                        placeholder="Password" minLength={8}
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange}
                                        placeholder="Confirm Password" minLength={8}
                                        className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-4 font-semibold shadow-theme-sm transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </button>
                    </motion.form>
                )}

                <div className="mt-8 text-center text-sm text-muted">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary-hover font-bold transition-colors">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
