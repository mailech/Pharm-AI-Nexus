import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-screen bg-slate-950">
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-400" size={32} />
                            <h2 className="text-xl font-bold text-red-400">System Error</h2>
                        </div>
                        <p className="text-slate-300 text-sm mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
