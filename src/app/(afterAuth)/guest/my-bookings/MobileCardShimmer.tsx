export const MobileCardShimmer = () => (
    <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3 animate-pulse">
                <div className="h-5 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
        ))}
    </div>
);
