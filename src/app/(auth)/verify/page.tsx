'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export default function VerifyPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // OTP State (6 digits)
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setMounted(true);
        const savedEmail = sessionStorage.getItem('verify_email');
        if (savedEmail) setEmail(savedEmail);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        // Allow pasting
        if (value.length > 1) {
            const pastedData = value.slice(0, 6).split('');
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            inputRefs.current[Math.min(5, pastedData.length)]?.focus();
        } else {
            newOtp[index] = value;
            setOtp(newOtp);
            // Move to next input
            if (value !== '' && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return;

        setIsLoading(true);

        try {
            await apiClient.post('/auth/verify', {
                email,
                otp: code
            });

            sessionStorage.removeItem('verify_email');
            alert('Email verified successfully! You can now log in.');
            router.push('/login');
        } catch (error: any) {
            console.error('Verification failed:', error);
            alert(error.response?.data?.message || 'Invalid or expired verification code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            alert('No email found to resend code to.');
            return;
        }

        try {
            await apiClient.post('/auth/verify/resend', { email });
            alert(`Verification code resent to ${email}`);
        } catch (error: any) {
            console.error('Failed to resend:', error);
            alert(error.response?.data?.message || 'Failed to resend code. Please try again.');
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-base text-main relative flex items-center justify-center p-6 overflow-hidden">
            {/* Background Stylings */}
            <div className="absolute w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full bg-accent-success/10 blur-[120px] opacity-60" />
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

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-subtle rounded-3xl p-8 sm:p-12 shadow-theme-lg text-center"
            >
                <div className="mx-auto w-16 h-16 bg-accent-success/10 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8 text-accent-success" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">Verify your email</h1>
                <p className="text-muted text-sm mb-8">
                    We've sent a 6-digit verification code to
                    <br />
                    <span className="font-semibold text-main">{email || 'your email address'}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-center gap-2 sm:gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-base border border-subtle text-main rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-success focus:border-accent-success transition-all shadow-theme-sm"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length < 6}
                        className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-4 font-semibold shadow-theme-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Account'}
                        {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-sm text-muted">
                    Didn't receive the code?{' '}
                    <button onClick={handleResend} className="text-primary hover:text-primary-hover font-bold transition-colors">
                        Resend it
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
