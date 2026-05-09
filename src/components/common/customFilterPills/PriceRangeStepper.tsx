// components/common/pills/content/PriceRangeContent.tsx
'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

function parseIntLoose(s: string): number | undefined {
    const n = Number((s || '').replace(/[^\d]/g, ''));
    return Number.isFinite(n) ? n : undefined;
}

export function PriceRangeContent({
    value,
    onApply,
    fromLabel = 'From',
    toLabel = 'To',
}: {
    value?: { min?: number; max?: number };
    onApply: (next: { min?: number; max?: number }) => void;
    fromLabel?: string;
    toLabel?: string;
}) {
    const [min, setMin] = React.useState<number | undefined>(value?.min);
    const [max, setMax] = React.useState<number | undefined>(value?.max);

    React.useEffect(() => {
        setMin(value?.min);
        setMax(value?.max);
    }, [value?.min, value?.max]);

    return (
        <div className="flex items-end gap-3">
            <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">{fromLabel}</div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 border ring-[#F6CD28]">
                    <span className="text-muted-foreground">₹</span>
                    <Input
                        inputMode="numeric"
                        className="border-0 shadow-none focus-visible:ring-0 p-0 px-2 h-6"
                        placeholder="0"
                        value={min ?? ''}
                        onChange={(e) => setMin(parseIntLoose(e.target.value))}
                    />
                </div>
            </div>

            <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">{toLabel}</div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 border ring-[#F6CD28]">
                    <span className="text-muted-foreground">₹</span>
                    <Input
                        inputMode="numeric"
                        className="border-0 shadow-none focus-visible:ring-0 p-0 px-2 h-6"
                        placeholder="0"
                        value={max ?? ''}
                        onChange={(e) => setMax(parseIntLoose(e.target.value))}
                    />
                </div>
            </div>

            <button
                type="button"
                className="h-10 w-10 rounded-full bg-[#F6CD28] hover:bg-yellow-500 text-black flex items-center justify-center hover:cursor-pointer"
                onClick={() => onApply({ min, max })}
                aria-label="Apply"
            >
                <Check className="h-5 w-5" />
            </button>
        </div>
    );
}
