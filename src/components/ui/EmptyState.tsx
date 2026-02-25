'use client';

import { PackageX } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export function EmptyState({
    title = "No Data Found",
    message = "We couldn't find anything matching your request.",
    icon = <PackageX className="w-12 h-12 opacity-50" />,
    action
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-muted border-2 border-dashed border-subtle rounded-2xl bg-surface/30">
            <div className="mb-4 text-primary">
                {icon}
            </div>
            <p className="font-bold text-lg text-main mb-1">{title}</p>
            <p className="text-sm font-medium text-center max-w-sm mb-6">{message}</p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
