'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

type Option = Record<string, any>;

interface MultiSelectProps<T extends string | number = string> {
    options: Option[];
    value: T[];
    onChange: (value: T[]) => void;
    placeholder?: string;
    disabled?: boolean;
    valueKey?: string;
    labelKey?: string;
    className?: string;
}

export function MultiSelect<T extends string | number = string>({
    options,
    value,
    onChange,
    placeholder = 'Select options...',
    disabled = false,
    valueKey = 'value',
    labelKey = 'label',
    className,
}: MultiSelectProps<T>) {
    const [open, setOpen] = React.useState(false);
    const toggleOption = (val: T) => {
        if (disabled) return;
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    return (
        <div className={cn('w-full', disabled && 'cursor-not-allowed opacity-70', className)}>
            <Popover open={open && !disabled} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between rounded-2xl border-gray-200 bg-white h-auto py-3 px-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:border-[#F6CD28] hover:bg-white text-gray-700 transition-all",
                            open && "border-[#F6CD28] ring-2 ring-[#F6CD28]/20",
                            disabled && "cursor-not-allowed hover:border-gray-200"
                        )}
                        disabled={disabled}
                    >
                        {value?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {value.map((val) => {
                                    const label =
                                        options.find((o) => o[valueKey] === val)?.[labelKey] || val;
                                    return (
                                        <Badge
                                            key={val}
                                            variant="secondary"
                                            className="flex items-center bg-[#F6CD28]/10 text-gray-900 border-none px-2 py-1 rounded-lg gap-1.5 hover:bg-[#F6CD28]/20"
                                        >
                                            <span className="text-xs font-medium">{label}</span>
                                            {!disabled && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // prevents popover toggle
                                                        onChange(value.filter((v) => v !== val));
                                                    }}
                                                    className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </Badge>
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="text-gray-400 font-normal">{placeholder}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                {!disabled && (
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-none shadow-[0px_10px_40px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm mt-2">
                        <Command className="bg-transparent">
                            <CommandList className="max-h-[300px]">
                                <CommandGroup className="p-2">
                                    {options.map((opt) => {
                                        const optValue = opt[valueKey];
                                        const optLabel = opt[labelKey];
                                        const isSelected = value.includes(optValue);
                                        return (
                                            <CommandItem
                                                key={optValue}
                                                onSelect={() => toggleOption(optValue)}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1 last:mb-0",
                                                    isSelected ? "bg-[#F6CD28]/10 text-gray-900" : "hover:bg-gray-50"
                                                )}
                                            >
                                                <span className="text-sm font-medium">{optLabel}</span>
                                                <div className={cn(
                                                    "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                    isSelected ? "bg-[#F6CD28] border-[#F6CD28]" : "border-gray-300 bg-white"
                                                )}>
                                                    {isSelected && <Check className="h-3 w-3 text-black stroke-[3]" />}
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                )}
            </Popover>
        </div>
    );
}
