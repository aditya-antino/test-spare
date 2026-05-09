import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = 'text', label, error, containerClassName, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === 'password';

        return (
            <div className={cn('flex flex-col gap-1', containerClassName)}>
                {label && <label className="text-gray-900 text-sm font-semibold mb-1">{label}</label>}

                <div className="relative w-full">
                    <input
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        data-slot="input"
                        className={cn(
                            `w-full px-4 py-3 text-sm bg-white rounded-2xl placeholder:text-gray-400 
              shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-gray-200 transition-all 
              hover:border-[#F6CD28] focus:outline-none focus:ring-2 focus:ring-[#F6CD28]/20 flex overflow-hidden`,
                            isPassword ? 'pr-11' : '',
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>

                {error && <span className="text-red-400 text-sm">{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
