'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
    _id: string;
    title: string;
    content: string;
    image?: string;
    author: {
        username: string;
    };
    likes: string[];
    createdAt: string;
}



interface User {
    _id: string;
    username: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (!userRes.ok) {
                    router.push('/login');
                    return;
                }
                const userData = await userRes.json();
                setUser(userData.user);

                const questionsRes = await fetch('/api/questions');
                const questionsData = await questionsRes.json();
                setQuestions(questionsData.questions || []);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const elapsed = now.getTime() - past.getTime();

        if (elapsed < msPerMinute) return Math.round(elapsed / 1000) + ' seconds ago';
        else if (elapsed < msPerHour) return Math.round(elapsed / msPerMinute) + ' minutes ago';
        else if (elapsed < msPerDay) return Math.round(elapsed / msPerHour) + ' hours ago';
        else return Math.round(elapsed / msPerDay) + ' days ago';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-black">
                <div className="text-sm font-mono animate-pulse">LOADING_DATA...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-sans">
            {/* Header */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/dashboard" className="text-xl font-bold tracking-tighter">
                        MATH LOVERS
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/rankings" className="hidden sm:inline text-sm font-bold uppercase tracking-wider hover:text-gray-600 transition-colors">
                            Rankings
                        </Link>
                        <span className="hidden sm:inline text-sm text-gray-500">@{user?.username}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-bold uppercase tracking-wider hover:text-gray-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold">Recent Doubts</h2>
                    <Link
                        href="/ask"
                        className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        Ask a Doubt
                    </Link>
                </div>

                <div className="space-y-6">
                    {questions.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-gray-300">
                            <p className="text-gray-500">No doubts asked yet. Be the first!</p>
                        </div>
                    ) : (
                        questions.map((q) => (
                            <div key={q._id} className="group border-b border-gray-200 pb-6 hover:bg-gray-50 transition-colors -mx-4 px-4 rounded-xl">
                                <Link href={`/question/${q._id}`} className="block">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-mono">
                                        <span className="font-bold text-black">@{q.author?.username || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{getTimeAgo(q.createdAt)}</span>
                                        {q.image && <span className="ml-2 text-[10px] font-bold border border-black text-black px-1 rounded uppercase">IMG</span>}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 group-hover:underline decoration-1 underline-offset-4">
                                        {q.title}
                                    </h3>
                                    <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                                        {q.content}
                                    </p>
                                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                            {q.likes.length}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Read more →
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
