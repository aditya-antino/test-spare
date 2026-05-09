'use client';
import * as React from 'react';
import { Minus, Plus, Check } from 'lucide-react';

export function AttendeesStepperContent({
    value,
    onApply,
    min = 0,
    max = 999,
}: {
    value?: number;
    onApply: (next: number) => void;
    min?: number;
    max?: number;
}) {
    // Use string state to allow typing freely
    const [temp, setTemp] = React.useState<string>((value ?? min).toString());

    // Sync with external value
    React.useEffect(() => setTemp((value ?? min).toString()), [value, min]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTemp(e.target.value); // store raw input
    };

    const increment = () => {
        const num = parseInt(temp, 10) || min;
        setTemp(Math.min(num + 1, max).toString());
    };

    const decrement = () => {
        const num = parseInt(temp, 10) || min;
        setTemp(Math.max(num - 1, min).toString());
    };

    const handleApply = () => {
        let num = parseInt(temp, 10);
        if (isNaN(num)) num = min;
        num = Math.min(Math.max(num, min), max);
        setTemp(num.toString());
        onApply(num);
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                className="h-9 w-9 rounded-full border flex items-center justify-center hover:cursor-pointer"
                onClick={decrement}
            >
                <Minus className="h-4 w-4" />
            </button>

            <input
                type="text"
                className="w-16 text-center rounded-md p-1 border-none outline-none "
                value={temp}
                onChange={handleChange}
            />

            <button
                type="button"
                className="h-9 w-9 rounded-full border flex items-center justify-center hover:cursor-pointer"
                onClick={increment}
            >
                <Plus className="h-4 w-4" />
            </button>

            <button
                type="button"
                className="ml-2 h-9 w-9 rounded-full bg-[#F6CD28] hover:bg-yellow-500 text-black flex items-center justify-center hover:cursor-pointer"
                onClick={handleApply}
                aria-label="Apply"
            >
                <Check className="h-4 w-4" />
            </button>
        </div>
    );
}
