'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

interface Answer {
    _id: string;
    content: string;
    image?: string;
    author: { _id: string; username: string };
    likes: string[];
    createdAt: string;
}

interface Question {
    _id: string;
    title: string;
    content: string;
    image?: string;
    author: { _id: string; username: string };
    likes: string[];
    createdAt: string;
}

export default function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [newAnswer, setNewAnswer] = useState('');
    const [answerImage, setAnswerImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    useEffect(() => {
        // Determine current user ID if possible
        fetch('/api/auth/me').then(res => res.json()).then(data => {
            if (data.user) setCurrentUser(data.user._id);
        }).catch(() => { });

        const fetchQuestion = async () => {
            try {
                const res = await fetch(`/api/questions/${id}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setQuestion(data.question);
                setAnswers(data.answers);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [id]);

    const handlePostAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnswer.trim()) return;

        try {
            const res = await fetch(`/api/questions/${id}/answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newAnswer,
                    image: answerImage
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setAnswers([data.answer, ...answers]); // Prepend new answer
                setNewAnswer('');
                setAnswerImage(null);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to post answer', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAnswerImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLike = async (targetId: string, type: 'question' | 'answer') => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        // Optimistic update
        if (type === 'question' && question) {
            const isLiked = question.likes.includes(currentUser);
            const newLikes = isLiked
                ? question.likes.filter(uid => uid !== currentUser)
                : [...question.likes, currentUser];
            setQuestion({ ...question, likes: newLikes });
        } else {
            setAnswers(answers.map(a => {
                if (a._id === targetId) {
                    const isLiked = a.likes.includes(currentUser);
                    const newLikes = isLiked
                        ? a.likes.filter(uid => uid !== currentUser)
                        : [...a.likes, currentUser];
                    return { ...a, likes: newLikes };
                }
                return a;
            }));
        }

        try {
            await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId, type }),
            });
        } catch (error) {
            console.error('Like failed', error);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!confirm('Are you sure you want to delete this doubt?')) return;
        try {
            const res = await fetch(`/api/questions/${id}/delete`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to delete question', error);
        }
    };

    const handleDeleteAnswer = async (answerId: string) => {
        if (!confirm('Are you sure you want to delete this answer?')) return;
        try {
            const res = await fetch(`/api/answers/${answerId}/delete`, { method: 'DELETE' });
            if (res.ok) {
                setAnswers(answers.filter(a => a._id !== answerId));
            }
        } catch (error) {
            console.error('Failed to delete answer', error);
        }
    };

    if (loading) return <div className="p-10 font-mono text-center">LOADING...</div>;
    if (!question) return <div className="p-10 font-mono text-center">QUESTION NOT FOUND</div>;

    return (
        <div className="min-h-screen bg-white text-black font-sans pb-20">
            <nav className="border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur z-20">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link href="/dashboard" className="text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black">
                        ← Back to Feed
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Question Section */}
                <article className="mb-12">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-mono">
                            <span className="font-bold text-black bg-gray-100 px-2 py-1 rounded">@{question.author.username}</span>
                            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                        {currentUser === question.author._id && (
                            <button
                                onClick={handleDeleteQuestion}
                                className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-6">{question.title}</h1>

                    {question.image && (
                        <div className="mb-8 rounded-lg overflow-hidden border border-gray-200">
                            <img src={question.image} alt="Question Attachment" className="w-full max-h-[500px] object-contain bg-gray-50" />
                        </div>
                    )}

                    <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap border-l-4 border-black pl-6 mb-8">
                        {question.content}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleLike(question._id, 'question')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider border transition-colors ${question.likes.includes(currentUser || '') ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                            {question.likes.length} Likes
                        </button>
                    </div>
                </article>

                <hr className="border-gray-200 my-10" />

                {/* Answers Section */}
                <section>
                    <h3 className="text-xl font-bold mb-8 uppercase tracking-wider">{answers.length} Answers</h3>

                    <div className="space-y-8">
                        {answers.map(answer => (
                            <div key={answer._id} className="bg-gray-50 p-6 rounded-xl group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
                                        <span className="font-bold text-black">@{answer.author.username}</span>
                                        <span>•</span>
                                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {currentUser === answer.author._id && (
                                        <button
                                            onClick={() => handleDeleteAnswer(answer._id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{answer.content}</p>
                                {answer.image && (
                                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={answer.image} alt="Answer Attachment" className="w-full max-h-[300px] object-contain bg-gray-50" />
                                    </div>
                                )}

                                <button
                                    onClick={() => handleLike(answer._id, 'answer')}
                                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${answer.likes.includes(currentUser || '') ? 'text-red-600' : 'text-gray-400 hover:text-black'}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill={answer.likes.includes(currentUser || '') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                    {answer.likes.length}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Post Answer Form */}
                    <div className="mt-12">
                        <h4 className="font-bold mb-4">Your Answer</h4>
                        <form onSubmit={handlePostAnswer}>
                            <textarea
                                className="w-full p-4 border border-gray-300 rounded-lg focus:border-black outline-none transition-colors min-h-[150px]"
                                placeholder="Write your solution here..."
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                required
                            />

                            {answerImage && (
                                <div className="mt-4 relative inline-block">
                                    <img src={answerImage} alt="Preview" className="h-32 rounded border border-gray-300" />
                                    <button
                                        type="button"
                                        onClick={() => setAnswerImage(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            )}

                            <div className="mt-4 flex justify-between items-center">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="answer-image-upload"
                                        className="hidden" // Tailwind hidden plays nice with label
                                        onChange={(e) => {
                                            // console.log('File selected'); // debug
                                            handleImageUpload(e);
                                        }}
                                    />
                                    <label
                                        htmlFor="answer-image-upload"
                                        className="cursor-pointer flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        Add Image
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newAnswer.trim()}
                                    className="px-6 py-2 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
                                >
                                    Post Answer
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}
