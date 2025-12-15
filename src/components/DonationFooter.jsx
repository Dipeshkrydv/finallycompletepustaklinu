import { Heart, CreditCard, Smartphone, Banknote } from 'lucide-react';

export default function DonationFooter({ role = 'buyer' }) {
    const isSeller = role === 'seller';
    const percentage = isSeller ? '5%' : '10%';
    const message = isSeller
        ? "As a seller, helps us maintain the platform by contributing just 5% of your sales."
        : "A small contribution makes a big difference. Help us keep this platform alive for every student (10%).";

    return (
        <div className="mt-12 mb-6 px-4 md:px-8">
            <div className={`bg-gradient-to-r ${isSeller ? 'from-amber-50 to-orange-50 border-amber-100' : 'from-red-50 to-amber-50 border-red-100'} rounded-3xl p-8 border shadow-sm relative overflow-hidden`}>
                {/* Decorative Background Elements */}
                <div className={`absolute top-0 right-0 -mt-10 -mr-10 opacity-50 ${isSeller ? 'text-amber-100' : 'text-red-100'}`}>
                    <Heart size={200} fill="currentColor" />
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 animate-pulse ${isSeller ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-500'}`}>
                            <Heart size={32} fill="currentColor" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Connected to the Heart ❤️</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto font-medium">
                            {message}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* eSewa */}
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-100 hover:border-green-300 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                                    <Smartphone size={20} />
                                </div>
                                <h3 className="font-bold text-green-800">eSewa</h3>
                            </div>
                            <div className="text-sm font-mono text-gray-500 bg-gray-50 p-2 rounded text-center">
                                (Coming Soon)
                            </div>
                        </div>

                        {/* Khalti */}
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-100 hover:border-purple-300 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                                    <Smartphone size={20} />
                                </div>
                                <h3 className="font-bold text-purple-800">Khalti</h3>
                            </div>
                            <div className="text-sm font-mono text-gray-500 bg-gray-50 p-2 rounded text-center">
                                ____ - ____
                            </div>
                        </div>

                        {/* Ncell */}
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                                    <Smartphone size={20} />
                                </div>
                                <h3 className="font-bold text-blue-800">Ncell</h3>
                            </div>
                            <div className="text-sm font-mono text-gray-500 bg-gray-50 p-2 rounded text-center">
                                (Coming Soon)
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 hover:border-gray-400 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:scale-110 transition-transform">
                                    <Banknote size={20} />
                                </div>
                                <h3 className="font-bold text-gray-800">Bank Transfer</h3>
                            </div>
                            <div className="text-sm font-mono text-gray-500 bg-gray-50 p-2 rounded text-center">
                                (Coming Soon)
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${isSeller ? 'text-amber-800 bg-amber-100 border-amber-200' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                            ✨ Direct Support • {percentage} Contribution • 100% Trust ✨
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
