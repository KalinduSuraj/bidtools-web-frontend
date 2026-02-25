'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Moon, Sun, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export default function LoginPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await apiClient.post('/auth/login', { email, password });

            // Assume backend returns { token, refresh_token, user: { ... } }
            // or { access_token, user: { ... } }
            const token = data.access_token || data.token;
            const refreshToken = data.refresh_token || ''; // Refresh token is optional depending on exact backend flow
            const userData = data.user || data;

            let redirectUrl = '/contractor/dashboard';
            const roleName = userData?.role?.name || userData?.role || 'contractor';

            if (roleName === 'admin') {
                redirectUrl = '/admin/dashboard';
            } else if (roleName === 'supplier') {
                redirectUrl = '/supplier/dashboard';
            }

            login(token, refreshToken, {
                user_id: userData.user_id || `${roleName}-123`,
                name: userData.name || userData.email || email,
                email: userData.email || email,
                role: { name: roleName },
                status: userData.status || 'active',
                created_at: userData.created_at || new Date().toISOString()
            });

            router.push(redirectUrl);
        } catch (error: any) {
            console.error('Login failed:', error);
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base text-main relative flex items-center justify-center p-6 overflow-hidden transition-colors duration-300">
            {/* Background Stylings */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[30%] h-[40%] rounded-full bg-primary-glow blur-[100px] opacity-60" />
                <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[30%] rounded-full bg-accent-success/10 blur-[120px] opacity-50" />
            </div>

            {/* Top Navigation for Login Page */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-danger shadow-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden sm:block">BidTools</span>
                </Link>
            </div>

            <div className="absolute top-6 right-6">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full bg-surface hover:bg-surface-hover shadow-theme-sm transition-colors text-muted hover:text-main border border-subtle"
                    suppressHydrationWarning
                >
                    {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
                </button>
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-subtle rounded-3xl p-8 sm:p-12 shadow-theme-lg"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome Back</h1>
                    <p className="text-muted text-sm">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-theme-sm"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-base border border-subtle text-main rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-theme-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-primary focus:ring-primary bg-base border-subtle accent-primary" />
                            <span className="text-muted hover:text-main transition-colors">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="text-primary hover:text-primary-hover font-medium transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-4 font-semibold shadow-theme-sm hover:shadow-theme-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:text-primary-hover font-bold transition-colors">
                        Create account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
