import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 bg-opacity-75 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-amber-200 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-16 h-16 text-amber-600 animate-spin relative z-10" />
                </div>
                <p className="text-amber-800 font-medium text-lg animate-pulse">Loading Pustaklinu...</p>
            </div>
        </div>
    );
}
