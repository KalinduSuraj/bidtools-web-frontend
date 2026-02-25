'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role?.name !== 'supplier' && user?.role?.name !== 'admin') {
                // Only allow suppliers (and admins for viewing)
                router.push('/login');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-base flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
