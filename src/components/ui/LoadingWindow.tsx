'use client';

import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingWindowProps {
    message?: string;
    submessage?: string;
    fullScreen?: boolean;
}

export function LoadingWindow({
    message = "Loading Data...",
    submessage = "Please wait while we fetch the latest information.",
    fullScreen = false
}: LoadingWindowProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-12 text-muted border-2 border-dashed border-subtle rounded-2xl bg-surface/50 backdrop-blur-sm ${fullScreen ? 'min-h-[60vh] border-none bg-transparent' : 'min-h-[400px]'}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <Loader2 className="w-10 h-10 text-primary mb-4" />
            </motion.div>
            <p className="font-bold text-lg text-main">{message}</p>
            <p className="text-sm font-medium mt-1 text-center max-w-md">{submessage}</p>
        </div>
    );
}
