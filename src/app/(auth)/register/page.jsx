'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { UserPlus, User, Mail, Phone, Lock, MapPin, Navigation, ArrowRight, Building, Map } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'buyer',
    address: '',
    city: '',
    state: '',
    pincode: '',
    province: '',
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error

  useEffect(() => {
    if (formData.role === 'seller' || formData.role === 'buyer') {
      requestLocation();
    }
  }, [formData.role]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocationStatus('success');
          toast.success('Location fetched successfully!');
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationStatus('error');
          let msg = 'Could not fetch location.';
          if (err.code === 1) msg = 'Location permission denied. Please enable it in browser settings.';
          else if (err.code === 2) msg = 'Location unavailable. Try again.';
          else if (err.code === 3) msg = 'Location request timed out.';
          toast.warn(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('error');
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if ((formData.role === 'seller' || formData.role === 'buyer') && !formData.latitude) {
      toast.error('Location is mandatory. Please allow location access to continue.');
      requestLocation(); // Try requesting again
      setLoading(false);
      return;
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } else {
      toast.error(data.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-amber-100">
        <div className="text-center mb-8">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join Pustaklinu community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              {['buyer', 'seller'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`py-3 px-4 rounded-lg border-2 font-medium capitalize transition ${formData.role === role
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-600 hover:border-amber-200'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
                  placeholder="9876543210"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Status */}
          {(formData.role === 'seller' || formData.role === 'buyer') && (
            <div className={`p-4 rounded-lg flex items-center justify-between gap-3 ${locationStatus === 'success' ? 'bg-green-50 text-green-700' :
              locationStatus === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
              <div className="flex items-center gap-2">
                <Navigation className={`w-5 h-5 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">
                  {locationStatus === 'success' ? 'Location fetched successfully' :
                    locationStatus === 'error' ? 'Failed to fetch location.' :
                      'Fetching your location...'}
                </span>
              </div>
              <button
                type="button"
                onClick={requestLocation}
                className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold shadow-sm hover:bg-gray-50 transition"
              >
                {locationStatus === 'loading' ? 'Retry' : 'Get Location'}
              </button>
            </div>
          )}

          {/* Seller Specific Fields */}
          {formData.role === 'seller' && (
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-600" /> Address Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900" required />
                </div>
              </div>
            </div>
          )}

          {/* Buyer Specific Fields */}
          {formData.role === 'buyer' && (
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Map className="w-5 h-5 text-amber-600" /> Location Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                  <input type="text" name="province" value={formData.province} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900" required />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating Account...' : (
              <>
                Create Account <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 font-semibold hover:text-amber-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
