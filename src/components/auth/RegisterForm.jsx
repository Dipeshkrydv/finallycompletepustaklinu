'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Navigation, ArrowRight, Building, Map, KeyRound, X } from 'lucide-react';

export default function RegisterForm() {
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
        province: '',
        latitude: null,
        longitude: null,
    });
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

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

    const initiateRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic Validation
        if ((formData.role === 'seller' || formData.role === 'buyer') && !formData.latitude) {
            toast.error('Location is mandatory. Please allow location access using "Get Location" button.');
            setLoading(false);
            return;
        }

        try {
            // Send OTP Request
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.dev_otp) {
                    toast.info(`DEV MODE: OTP is ${data.dev_otp}`);
                } else {
                    toast.success('Verification code sent to your email!');
                }
                setOtpSent(true);
                setShowOtpModal(true);
            } else {
                toast.error(data.error || 'Failed to send verification code');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, otp }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Registration successful! Please login.');
                router.push('/login');
            } else {
                toast.error(data.error || 'Registration failed');
                if (data.error && data.error.includes('expired')) {
                    setShowOtpModal(false); // Close modale to allow retry
                }
            }
        } catch (error) {
            toast.error('An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={initiateRegistration} className="space-y-6">
                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                    <div className="grid grid-cols-2 gap-4">
                        {['buyer', 'seller'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setFormData({ ...formData, role })}
                                className={`py-3 px-4 rounded-lg border-2 font-medium capitalize transition-all transform active:scale-95 ${formData.role === role
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 transition-shadow"
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 transition-shadow"
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 transition-shadow"
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 transition-shadow"
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
                            className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold shadow-sm hover:bg-gray-50 transition active:scale-95"
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
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 transition-shadow" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 transition-shadow" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 transition-shadow" required />
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
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 transition-shadow" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                <input type="text" name="province" value={formData.province} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 transition-shadow" required />
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-6 active:scale-[0.98]"
                >
                    {loading ? 'Sending Code...' : (
                        <>
                            Verify Email & Continue <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-fade-in-up transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Verify Email</h3>
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 active:scale-90 transition-transform"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-center mb-6">
                            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                                <Mail className="w-8 h-8" />
                            </div>
                            <p className="text-gray-600 text-sm">
                                One-Time Password sent to <br />
                                <span className="font-bold text-gray-800">{formData.email}</span>
                            </p>
                        </div>
                        <form onSubmit={handleFinalRegister} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-gray-900 text-center text-lg tracking-widest font-bold"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowOtpModal(false)}
                                className="w-full text-gray-500 text-sm hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
