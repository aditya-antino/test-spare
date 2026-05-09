import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeroTimeSelectorProps {
    label: string;
    value: string;
    onChange: (time: string) => void;
}

export default function HeroTimeSelector({ label, value, onChange }: HeroTimeSelectorProps) {
    const [timePart, periodPart] = value.split(' ') as [string, string?];
    const [hourStr, minuteStr] = (timePart || '12:00').split(':');
    const period = periodPart || 'AM';

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ['AM', 'PM'];

    return (
        <div className="flex flex-col gap-2 p-3">
            <span className="text-gray-900 text-xs font-bold uppercase tracking-wider mb-1">
                {label}
            </span>

            <div className="flex gap-2 items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="rounded-xl p-2.5 font-medium transition-all focus:outline-none flex items-center justify-between w-20 border border-gray-200 bg-white text-gray-700 hover:border-[#F6CD28] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)]"
                        >
                            {hourStr.padStart(2, '0')}
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-20 max-h-48 overflow-y-auto bg-white/95 backdrop-blur-sm border-gray-100 rounded-xl shadow-xl">
                        {hours.map((h) => (
                            <DropdownMenuItem
                                key={h}
                                onClick={() => onChange(`${h}:${minuteStr} ${period}`)}
                                className={cn(
                                    "cursor-pointer justify-center rounded-lg mb-1 last:mb-0",
                                    h === hourStr.padStart(2, '0') ? "bg-[#F6CD28]/20 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {h}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="rounded-xl p-2.5 font-medium transition-all focus:outline-none flex items-center justify-between w-20 border border-gray-200 bg-white text-gray-700 hover:border-[#F6CD28] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)]"
                        >
                            {minuteStr.padStart(2, '0')}
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-20 max-h-48 overflow-y-auto bg-white/95 backdrop-blur-sm border-gray-100 rounded-xl shadow-xl"
                    >
                        {minutes.map((m) => (
                            <DropdownMenuItem
                                key={m}
                                onClick={() => onChange(`${hourStr}:${m} ${period}`)}
                                className={cn(
                                    "cursor-pointer justify-center rounded-lg mb-1 last:mb-0",
                                    m === minuteStr.padStart(2, '0') ? "bg-[#F6CD28]/20 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {m}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="rounded-xl p-2.5 font-medium transition-all focus:outline-none flex items-center justify-between w-20 border border-gray-200 bg-white text-gray-700 hover:border-[#F6CD28] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)]"
                        >
                            {period}
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-20 bg-white/95 backdrop-blur-sm border-gray-100 rounded-xl shadow-xl"
                    >
                        {periods.map((p) => (
                            <DropdownMenuItem
                                key={p}
                                onClick={() => onChange(`${hourStr}:${minuteStr} ${p}`)}
                                className={cn(
                                    "cursor-pointer justify-center rounded-lg mb-1 last:mb-0",
                                    p === period ? "bg-[#F6CD28]/20 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {p}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

    );
}
