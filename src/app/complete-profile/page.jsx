'use client';

import { useState, useEffect } from 'react';
import { useSession, update } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { User, Store, Phone, Check, ArrowRight, Loader2, Navigation, MapPin } from 'lucide-react';
import BrandLoader from '@/components/BrandLoader';

export default function CompleteProfile() {
    const { data: session, status, update: updateSession } = useSession();
    const router = useRouter();
    const [role, setRole] = useState('buyer');

    // Address / Location State
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState(''); // Used for Buyer: 'province', Seller: 'state'
    const [streetAddress, setStreetAddress] = useState(''); // Seller only

    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locationStatus, setLocationStatus] = useState('idle');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role && session?.user?.phone) {
            router.push(`/dashboard/${session.user.role}`);
        }
    }, [session, status, router]);

    const requestLocation = () => {
        if (navigator.geolocation) {
            setLocationStatus('loading');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationStatus('success');
                    toast.success('Location fetched successfully!');
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setLocationStatus('error');
                    let msg = 'Could not fetch location.';
                    if (err.code === 1) msg = 'Location permission denied.';
                    else if (err.code === 2) msg = 'Location unavailable.';
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!phone) {
            toast.error('Please enter your phone number');
            return;
        }

        if (!location.lat || !location.lng) {
            toast.error('Location is mandatory. Please click "Get Location".');
            requestLocation();
            return;
        }

        if (!city || !province) {
            toast.error('Please fill in city and district/province');
            return;
        }

        if (role === 'seller' && (!streetAddress)) {
            toast.error('Please fill in complete address for seller account');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                role,
                phone,
                city,
                latitude: location.lat,
                longitude: location.lng,
                // Map frontend state to DB fields
                state: role === 'seller' ? province : undefined, // Seller uses 'state', DB has 'state'
                province: role === 'buyer' ? province : undefined, // Buyer uses 'province', DB has 'province'
                address: role === 'seller' ? streetAddress : undefined,
            };

            const res = await fetch('/api/user/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            toast.success('Profile completed successfully!');

            await updateSession({
                ...session,
                user: {
                    ...session?.user,
                    role: data.user.role,
                    phone: data.user.phone,
                    requiresProfileCompletion: false
                }
            });

            window.location.href = `/dashboard/${data.user.role}`;

        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    if (status === 'loading' || !session) {
        return <BrandLoader />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-amber-100 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
                        <User className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
                    <p className="text-gray-500 mt-2">We need a few more details to set up your {role} account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Select your account type</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['buyer', 'seller'].map((r) => (
                                <div
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`cursor-pointer relative p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center ${role === r
                                        ? 'border-amber-500 bg-amber-50/50 shadow-md'
                                        : 'border-gray-200 hover:border-amber-200 bg-white'
                                        }`}
                                >
                                    {role === r && <div className="absolute top-2 right-2 text-amber-600"><Check className="w-4 h-4" /></div>}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${role === r ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}>
                                        {r === 'buyer' ? <User className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                                    </div>
                                    <span className="font-bold capitalize text-gray-800">{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                                placeholder="9876543210"
                                required
                            />
                        </div>
                    </div>

                    {/* Location Button */}
                    <div className={`p-4 rounded-lg flex items-center justify-between gap-3 ${locationStatus === 'success' ? 'bg-green-50 text-green-700' :
                        locationStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                        <div className="flex items-center gap-2">
                            <Navigation className={`w-5 h-5 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">
                                {locationStatus === 'success' ? 'Location fetched successfully' :
                                    locationStatus === 'error' ? 'Failed to fetch location.' :
                                        'Location access is required'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={requestLocation}
                            className="px-3 py-1 bg-white border border-transparent hover:border-gray-200 rounded-md text-xs font-bold shadow-sm transition"
                        >
                            {locationStatus === 'loading' ? 'Retry' : 'Get Location'}
                        </button>
                    </div>

                    {/* Address Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                                placeholder="Kathmandu"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{role === 'seller' ? 'State' : 'Province/District'}</label>
                            <input
                                type="text"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                                placeholder={role === 'seller' ? 'Bagmati' : 'District Name'}
                                required
                            />
                        </div>
                        {role === 'seller' && (
                            <>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                    <input
                                        type="text"
                                        value={streetAddress}
                                        onChange={(e) => setStreetAddress(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900"
                                        required
                                    />
                                </div>

                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Finish Setup <ArrowRight className="w-6 h-6" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
