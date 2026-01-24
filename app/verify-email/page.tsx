'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPage() {
    const { user, loading, resendVerificationEmail } = useAuth();
    const router = useRouter();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);

    // Redirect if verified
    useEffect(() => {
        if (!loading && user?.emailVerified) {
            router.push('/dashboard');
        } else if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0 || !user?.email) return;

        setSending(true);
        setMessage('');
        try {
            const res = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send');
            }

            setMessage('Verification email sent! Please check your inbox.');
            setCooldown(60); // 60s cooldown
        } catch (error: any) {
            setMessage('Error sending email: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    const handleReload = async () => {
        if (!user) return;
        setSending(true);
        try {
            await user.reload();
            if (user.emailVerified) {
                // Determine username from user object or just let the backend handle it if we have ID token
                // The backend endpoint accepts { idToken } and upgrades/create session
                const idToken = await user.getIdToken(true);
                await fetch('/api/auth/firebase-callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });
                // Force a hard reload to pick up the new cookie in Server Components
                window.location.href = '/dashboard';
            } else {
                setMessage('Email still not verified. Please check your inbox.');
                setSending(false);
            }
        } catch (error: any) {
            console.error('Verify error:', error);
            setMessage('Error verifying status: ' + error.message);
            setSending(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-black">
            <div className="w-full max-w-md p-8 bg-white border border-gray-200 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tighter mb-2">Verify Your Email</h2>
                    <p className="text-gray-500">
                        We sent a verification email to <span className="font-bold text-black">{user?.email}</span>.
                        <br />
                        Please verify your email to continue to the dashboard.
                    </p>
                </div>

                {message && (
                    <div className={`mb-6 p-3 text-sm rounded ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleReload}
                        className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        I Verified It
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={sending || cooldown > 0}
                        className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest border-2 border-black hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {sending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
                    </button>

                    <button
                        onClick={() => window.location.href = '/login'} // Force full logout/redirect
                        className="text-sm text-gray-500 hover:text-black underline"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
