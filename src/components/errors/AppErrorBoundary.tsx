'use client';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
                    <h2 className="text-2xl font-semibold mb-2 text-zinc-800">Something went wrong</h2>
                    <p className="text-muted-foreground mb-4">
                        We apologize for the inconvenience. Please try refreshing the page.
                    </p>
                    <button
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
