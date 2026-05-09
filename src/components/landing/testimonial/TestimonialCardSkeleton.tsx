const TestimonialCardSkeleton = () => {
    return (
        <div className="rounded-2xl shadow-sm border border-gray-200 bg-white animate-pulse overflow-hidden">
            <div className="flex items-start justify-between p-6 gap-4">
                <div>
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-4 w-4 bg-gray-300 rounded-full"></div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
        </div>
    );
};

export default TestimonialCardSkeleton;
