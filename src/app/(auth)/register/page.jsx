'use client';

import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4 py-12 relative animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-amber-100">
        <div className="text-center mb-8">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-sm">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join Pustaklinu community today</p>
        </div>

        <RegisterForm />

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 font-semibold hover:text-amber-700 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
