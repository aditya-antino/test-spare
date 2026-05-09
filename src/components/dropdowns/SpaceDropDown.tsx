'use client';

import React, { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Building, ChevronDown } from 'lucide-react';
import Loader from '../ui/loader';
import { useGetHostSpaces } from '@/services';

interface SpaceOption {
    value: number | null;
    label: string;
    imageUrl?: string;
}

interface SpaceDropDownProps {
    selectedSpace: number | null;
    onSpaceChange: (value: number | null) => void;
}

const SpaceDropDown: React.FC<SpaceDropDownProps> = ({ selectedSpace, onSpaceChange }) => {
    const [spaceOptions, setSpaceOptions] = useState<SpaceOption[]>([
        { value: null, label: 'All Listings' },
    ]);
    const [isOpen, setIsOpen] = useState(false);

    const { data, isLoading, error, refetch } = useGetHostSpaces(false);

    useEffect(() => {
        if (isOpen && spaceOptions.length === 1) {
            refetch();
        }
    }, [isOpen, spaceOptions.length, refetch]);

    useEffect(() => {
        if (data?.data?.listings?.rows) {
            const formatted = data.data.listings.rows.map((space: any) => ({
                value: space.id,
                label: space.title,
                imageUrl: space.SpaceImages?.[0]?.imageUrl,
            }));

            setSpaceOptions([{ value: null, label: 'All Listings' }, ...formatted]);
        }
    }, [data]);

    const selectedLabel =
        selectedSpace === null
            ? 'All Listings'
            : spaceOptions.find((s) => s.value === selectedSpace)?.label || '-';

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    className="h-10 gap-3 justify-between sm:justify-start min-w-[150px]"
                    variant="outline"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <Building className="text-zinc-800 w-5 h-5 flex-shrink-0" />
                        <span className="truncate sm:inline">{selectedLabel}</span>
                    </div>
                    <ChevronDown className="text-zinc-800 w-5 h-5 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-10">
                        <Loader size={20} />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-sm py-2 px-4">Error fetching spaces</div>
                ) : (
                    spaceOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value === null ? 'all' : option.value}
                            className="py-3.5 px-4 text-sm cursor-pointer flex items-center gap-2"
                            onClick={() => {
                                onSpaceChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.value === null ? (
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-gray-600" />
                                    <span className="font-medium">{option.label}</span>
                                </div>
                            ) : (
                                <>
                                    {option.imageUrl && (
                                        <img
                                            src={option.imageUrl}
                                            alt={option.label}
                                            className="w-6 h-6 rounded-md object-cover"
                                        />
                                    )}
                                    {option.label}
                                </>
                            )}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SpaceDropDown;
