'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Phone, Lock, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      identifier,
      password,
      redirect: false,
    });

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success('Logged in successfully!');

      // POLL for session availability to ensure cookie is readable
      // Retry up to 10 times with 500ms delay (5 seconds total)
      let attempts = 0;
      const checkSession = async () => {
        const session = await getSession();
        if (session?.user?.role) {
          window.location.href = `/dashboard/${session.user.role}`;
        } else if (session?.user?.requiresProfileCompletion) {
          window.location.href = '/complete-profile';
        } else if (attempts < 10) {
          attempts++;
          setTimeout(checkSession, 500);
        } else {
          // Fallback if session is persistently unavailable, force root reload
          window.location.href = '/';
        }
      };

      checkSession();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none text-gray-900"
            placeholder="Enter email or phone number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none text-gray-900"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? 'Redirecting...' : (
          <>
            Sign In <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
