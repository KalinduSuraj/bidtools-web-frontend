'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorWindowProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    fullScreen?: boolean;
}

export function ErrorWindow({
    title = "System Error",
    message,
    onRetry,
    fullScreen = false
}: ErrorWindowProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-12 text-accent-danger border-2 border-dashed border-accent-danger/30 rounded-2xl bg-accent-danger/5 ${fullScreen ? 'min-h-[60vh] border-none' : 'min-h-[400px]'}`}>
            <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
            <p className="font-bold text-xl mb-2">{title}</p>
            <p className="text-sm font-medium max-w-md text-center mb-6">{message}</p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-accent-danger hover:bg-accent-danger/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-theme-sm"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            )}
        </div>
    );
}
