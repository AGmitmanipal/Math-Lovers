'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RankingUser {
  _id: string;
  username: string;
  questionCount: number;
  totalLikes: number;
}

export default function RankingsPage() {
  const router = useRouter();
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'all_time'>('weekly');

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/rankings?period=${period}`);
        if (res.ok) {
          const data = await res.json();
          setRankings(data);
        } else {
          console.error('Failed to fetch rankings');
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [period]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <div className="text-sm font-mono animate-pulse">LOADING_RANKINGS...</div>
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
            <Link href="/dashboard" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Dashboard
            </Link>
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-2">LEADERBOARD</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Top Contributors</p>
        </div>

        {/* Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${period === 'weekly'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('all_time')}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${period === 'all_time'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-black'
                }`}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">User</div>
            <div className="col-span-2 text-center">Questions</div>
            <div className="col-span-2 text-center">Likes</div>
          </div>

          <div className="divide-y divide-gray-100">
            {rankings.map((user, index) => (
              <div
                key={user._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-2 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-6">
                  <div className="font-bold text-base">{user.username}</div>
                </div>
                <div className="col-span-2 text-center font-mono text-sm text-gray-600">
                  {user.questionCount}
                </div>
                <div className="col-span-2 text-center font-mono text-sm text-gray-600">
                  {user.totalLikes}
                </div>
              </div>
            ))}

            {rankings.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500 text-sm">
                No rankings available yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
