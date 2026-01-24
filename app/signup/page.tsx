'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification,
    User
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { logout } = useAuth(); // We might need to handle partial sessions

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setIsLoading(true);

        try {
            // 0. Check Username Availability (Pre-check)
            const checkRes = await fetch('/api/auth/check-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: formData.username }),
            });
            const checkData = await checkRes.json();

            if (!checkData.available) {
                throw new Error('Username is already taken. Please choose another.');
            }

            // 1. Create User in Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // 2. Send Verification Email (Custom SMTP)
            await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            setInfo('Account created! A verification email has been sent to your inbox.');

            // 3. Sync with Backend (MongoDB)
            const idToken = await user.getIdToken();
            const res = await fetch('/api/auth/firebase-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken,
                    username: formData.username
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // If backend sync fails, delete firebase user to maintain consistency?
                // Or just show error. For now, show error.
                throw new Error(data.error || 'Failed to create account in database');
            }

            // 4. Redirect or Show Success
            // Since email is not verified, we should redirect to /verify-email or just show message
            // The AuthContext will pick up the user state.
            // But 'emailVerified' is false.

            router.push('/verify-email');

        } catch (err: any) {
            console.error('Signup Error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('That email is already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError(err.message || 'An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setIsLoading(true);
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const user = userCredential.user;
            const token = await user.getIdToken();

            const res = await fetch('/api/auth/firebase-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token }), // Username auto-generated if needed
            });

            if (res.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to authenticate with backend');
            }
        } catch (err: any) {
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                console.log('User closed the popup or cancelled the request.');
                setIsLoading(false);
                return;
            }
            console.error('Google Sign Up Error:', err);
            setError(err.message || 'Failed to sign up with Google');
        } finally {
            // Only set loading to false if we haven't already handled it
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-black">
            <div className="w-full max-w-md p-8 bg-white border border-gray-200">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tighter">
                        JOIN MATH LOVERS
                    </h2>
                    <p className="mt-2 text-gray-500">Create an account to start solving</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 text-sm bg-red-50 border border-red-200 text-red-600">
                        {error}
                    </div>
                )}

                {info && (
                    <div className="mb-6 p-4 text-sm bg-green-50 border border-green-200 text-green-600">
                        {info}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-white border-b-2 border-gray-300 focus:border-black outline-none transition-colors duration-200 placeholder-gray-400"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white border-b-2 border-gray-300 focus:border-black outline-none transition-colors duration-200 placeholder-gray-400"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-white border-b-2 border-gray-300 focus:border-black outline-none transition-colors duration-200 placeholder-gray-400"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="relative flex items-center justify-center my-6">
                        <hr className="w-full border-gray-300" />
                        <span className="absolute px-3 bg-white text-gray-400 text-sm">OR</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                        className="flex items-center justify-center w-full py-4 bg-white text-black font-bold uppercase tracking-widest border-2 border-black hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {isLoading ? 'Signing up...' : 'Sign up with Google'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-black border-b border-black pb-0.5 hover:text-gray-700">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
