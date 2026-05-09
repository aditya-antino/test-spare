import { SkeletonBase } from './SkeletonBase';

interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonBase
                    key={i}
                    className={`h-4 w-full ${i === lines - 1 && lines > 1 ? 'w-2/3' : ''}`}
                />
            ))}
        </div>
    );
}
