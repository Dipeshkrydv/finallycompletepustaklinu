
import Image from 'next/image';

export default function BrandLoader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-[9999]">
            <div className="relative flex flex-col items-center">
                {/* Pulsing Glow Background */}
                <div className="absolute inset-0 bg-amber-200/50 rounded-full blur-3xl animate-pulse scale-150"></div>

                {/* Logo with Breathe Animation */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 animate-[bounce_3s_infinite]">
                    <Image
                        src="/brand-logo.png"
                        alt="Loading..."
                        fill
                        className="object-contain drop-shadow-xl animate-[pulse_2s_ease-in-out_infinite]"
                        priority
                    />
                </div>

                {/* Loading Text */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <h3 className="text-2xl font-bold text-amber-900 tracking-widest animate-pulse">PUSTAKLINU</h3>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
