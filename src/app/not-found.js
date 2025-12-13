'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="bg-amber-100 p-6 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-20"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                Oops! The page you are looking for seems to have gone missing or has been moved.
            </p>
            <Link
                href="/"
                className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                Go Back Home
            </Link>
        </div>
    );
}
