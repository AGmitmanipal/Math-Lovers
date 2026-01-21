import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
            <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
            <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
