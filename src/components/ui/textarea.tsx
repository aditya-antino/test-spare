import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    maxLen?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, maxLen, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                {label && <label className="text-gray-900 text-sm font-semibold mb-1">{label}</label>}
                <textarea
                    data-slot="textarea"
                    className={cn(
                        'w-full px-4 py-3 text-sm bg-white rounded-2xl placeholder:text-gray-400 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-gray-200 transition-all hover:border-[#F6CD28] focus:outline-none focus:ring-2 focus:ring-[#F6CD28]/20 min-h-[120px] outline-none disabled:cursor-not-allowed disabled:opacity-50',
                        className,
                    )}
                    maxLength={maxLen}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
