
export default function Loading() {
    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 animate-pulse">
            <div className="w-32 h-6 bg-gray-200 rounded mb-6"></div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 bg-gray-200 rounded-full shrink-0"></div>
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-1/2">
                            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-64"></div>
        </div>
    );
}
