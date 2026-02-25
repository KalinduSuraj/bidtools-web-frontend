'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
            <ToastProvider>
                <AuthProvider>
                    {children}
                    <ToastContainer />
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
