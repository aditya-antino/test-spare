export const TableShimmer = () => (
    <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
            <div
                key={i}
                className="grid grid-cols-6 gap-4 items-center p-4 rounded-lg animate-pulse"
            >
                {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-5 w-full bg-gray-200 rounded-md" />
                ))}
            </div>
        ))}
    </div>
);
