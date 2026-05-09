import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    image?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}

export function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    image,
    icon,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-6 bg-gray-50 rounded-full p-6">
                {image ? (
                    <div className="relative w-40 h-40">
                        {/* Placeholder for image logic if using next/image */}
                        {/* <Image src={image} alt={title} fill className="object-contain" /> */}
                    </div>
                ) : icon ? (
                    <div className="text-gray-400">{icon}</div>
                ) : (
                    // Default generic icon if nothing provided
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-sm mb-6">{description}</p>

            {action ? (
                action
            ) : actionLabel && onAction ? (
                <Button onClick={onAction}>{actionLabel}</Button>
            ) : null}
        </div>
    );
}
