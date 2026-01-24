'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AskPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ title: '', content: '', image: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File is too big!");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans">
            <nav className="border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black">
                        ← Back
                    </Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8 tracking-tight">Ask a Doubt</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-0 py-2 bg-transparent border-b-2 border-gray-200 focus:border-black outline-none transition-colors text-xl font-medium placeholder-gray-300"
                            placeholder="e.g. How do I solve this integral?"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Description</label>
                        <textarea
                            required
                            rows={8}
                            className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-lg transition-colors placeholder-gray-400"
                            placeholder="Describe your doubt in detail..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider">Image (Optional)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-black file:text-white
                                    hover:file:bg-gray-800"
                            />
                            {formData.image && (
                                <div className="h-12 w-12 relative overflow-hidden rounded border border-gray-300">
                                    <img src={formData.image} alt="Preview" className="object-cover w-full h-full" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Posting...' : 'Post Doubt'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
