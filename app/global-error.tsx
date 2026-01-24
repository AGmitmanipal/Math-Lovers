'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black text-center px-4">
                    <h2 className="text-4xl font-bold mb-4 tracking-tighter">SOMETHING WENT WRONG!</h2>
                    <p className="mb-8 text-gray-500 max-w-md">
                        A critical error occurred. Our engineers have been notified.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                    {error.message && process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-100 border border-red-500 text-red-600 font-mono text-xs text-left w-full max-w-2xl overflow-auto">
                            {error.message}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
