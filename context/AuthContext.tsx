'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    resendVerificationEmail: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // If user is logged in but not verified, and trying to access protected routes
                // We handle redirection logic here or in specific page guards
                // For now, we just update state.

                // Optional: Force token refresh to ensure claims are up to date
                // await currentUser.getIdToken(true);
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            // Also call backend to clear cookie
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const resendVerificationEmail = async () => {
        if (user && !user.emailVerified) {
            await sendEmailVerification(user);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, resendVerificationEmail }}>
            {children}
        </AuthContext.Provider>
    );
}
