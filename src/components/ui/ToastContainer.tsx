'use client';

import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`flex items-start gap-3 p-4 rounded-xl border shadow-theme-lg min-w-[300px] max-w-md ${toast.type === 'success' ? 'bg-surface border-accent-success/30' :
                                toast.type === 'error' ? 'bg-surface border-accent-danger/30' :
                                    'bg-surface border-blue-500/30'
                            }`}
                    >
                        <div className="mt-0.5">
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-accent-success" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-accent-danger" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-main">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 rounded-md hover:bg-surface-hover text-muted hover:text-main transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
