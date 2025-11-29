import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
            <Loader2 className={`${sizeClasses[size]} text-teal-400 animate-spin`} />
            <p className="text-sm text-slate-400 font-mono">{message}</p>
        </div>
    );
}
