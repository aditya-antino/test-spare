'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Filter, Loader2, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
    setSelectedCategories,
    addSelectedCategory,
    removeSelectedCategory,
    clearSelectedCategories,
    setSelectedActivities,
    addSelectedActivity,
    removeSelectedActivity,
} from '@/store/slice/homePageSearchSlice';
import Instant from '../icons/Instant';

export type FilterOption = {
    label: string;
    ids: number[];
};

export type FilterSection =
    | { title: string; titleHighlighted: string; options: FilterOption[]; key?: string }
    | {
          title: string;
          key?: string;
          titleHighlighted: string;
          render: (ctx: {
              selectedNames: string[];
              toggleOption: (name: string) => void;
          }) => React.ReactNode;
      };

export type StickyToggle = {
    key: string;
    label: string;
    description?: string;
    enabled?: boolean;
    value?: string;
};

export type FiltersDrawerGenericProps = {
    sections?: FilterSection[];
    resultCount?: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    triggerLabel?: string;
    initialSelected?: Record<string, string[]>;
    onApply?: (selectedIds: Record<string, number[] | boolean>) => void;
    onChange?: (selected: Record<string, string[]>) => void;
    persistOnApply?: boolean;
    contentClassName?: string;
    optionCols?: 1 | 2 | 3 | 4;
    enableCategorySelection?: boolean;
    categories?: Array<{ id: number; name: string }>;
    categoriesLoading?: boolean;
    sectionsLoading?: boolean;
    onCategoryChange?: (categoryIds: number[]) => void;
};

export default function FiltersDrawerGeneric({
    sections,
    resultCount,
    open,
    onOpenChange,
    title = 'Filters',
    triggerLabel = 'Filters',
    initialSelected,
    onApply,
    onChange,
    persistOnApply = false,
    contentClassName,
    optionCols = 2,
    enableCategorySelection = false,
    categories = [],
    categoriesLoading = false,
    sectionsLoading = false,
    onCategoryChange,
}: FiltersDrawerGenericProps) {
    const dispatch = useDispatch();
    const selectedCategories = useSelector(
        (state: RootState) => state.homeSearchData.selectedCategories,
    );
    const selectedActivities = useSelector(
        (state: RootState) => state.homeSearchData.selectedActivities,
    );

    const activitySelectedNames = useMemo(
        () => selectedActivities.map((a) => a.name),
        [selectedActivities],
    );

    const [internalOpen, setInternalOpen] = useState(false);
    const [selected, setSelected] = useState<Record<string, string[]>>(
        initialSelected ?? { activities: activitySelectedNames },
    );
    const [stickyToggles, setStickyToggles] = useState<StickyToggle[]>([
        {
            key: 'instant_booking',
            label: 'Instant Booking',
            description: 'Show only spaces that can be booked immediately.',
            enabled: false,
            value: 'instant',
        },
    ]);

    useEffect(() => {
        if (initialSelected) {
            setSelected((prev) => ({
                ...prev,
                ...initialSelected,
            }));
        }
    }, [initialSelected]);

    const isControlled = typeof open === 'boolean';
    const effectiveOpen = isControlled ? open! : internalOpen;
    const setOpen = (v: boolean) => (isControlled ? onOpenChange?.(v) : setInternalOpen(v));

    const toggleOption = useCallback(
        (sectionKey: string, optionName: string, ids?: number[]) => {
            setSelected((prev) => {
                const prevArr = prev[sectionKey] ?? [];
                const nextSet = new Set(prevArr);
                if (nextSet.has(optionName)) {
                    nextSet.delete(optionName);
                } else {
                    nextSet.add(optionName);
                }
                const next = { ...prev, [sectionKey]: Array.from(nextSet) };
                onChange?.(next);
                return next;
            });
        },
        [onChange],
    );

    const handleCategoryToggle = useCallback(
        (categoryId: number) => {
            setSelected((prev) => {
                const sectionKey = 'categories';
                const category = categories.find((c) => c.id === categoryId);
                const categoryName = category?.name || '';

                const prevArr = prev[sectionKey] ?? [];
                const nextSet = new Set(prevArr);
                if (nextSet.has(categoryName)) {
                    nextSet.delete(categoryName);
                } else if (categoryName) {
                    nextSet.add(categoryName);
                }
                const next = { ...prev, [sectionKey]: Array.from(nextSet) };
                onChange?.(next);
                return next;
            });
        },
        [categories, onChange],
    );

    const resetAll = useCallback(() => {
        setSelected({
            categories: [],
            activities: [],
            space_types: [],
            amenities: [],
        });
        setStickyToggles((prev) => prev.map((t) => ({ ...t, enabled: false })));
    }, []);

    const totalSelected = useMemo(() => {
        const filterCount = Object.values(selected).reduce((a, b) => a + b.length, 0);
        const togglesCount = stickyToggles.filter((t) => t.enabled).length;
        return filterCount + togglesCount;
    }, [selected, stickyToggles]);

    const gridCols =
        optionCols === 1
            ? 'grid-cols-1'
            : optionCols === 3
                ? 'grid-cols-3'
                : optionCols === 4
                    ? 'grid-cols-4'
                    : 'grid-cols-2';

    const defaultAccordionOpen = useMemo(
        () => sections.map((s) => ('key' in s && s.key ? s.key : s.title)),
        [sections],
    );

    const handleApply = useCallback(() => {
        // Handle Redux state for Categories
        const finalSelectedCategoriesIds: number[] = [];
        const finalSelectedCategoriesObjects: any[] = [];
        const categoryNames = selected.categories || [];

        categoryNames.forEach((name) => {
            const cat = categories.find((c) => c.name === name);
            if (cat) {
                finalSelectedCategoriesIds.push(cat.id);
                finalSelectedCategoriesObjects.push({ item: cat, type: 'spaces' });
            }
        });
        dispatch(setSelectedCategories(finalSelectedCategoriesObjects));
        if (onCategoryChange) {
            onCategoryChange(finalSelectedCategoriesIds);
        }

        // Handle Redux state for Activities
        const finalSelectedActivities: any[] = [];
        const activitySection = sections.find((s) => ('key' in s && s.key === 'activities') || s.title === 'Activities');
        if (activitySection && 'options' in activitySection) {
            const activityNames = selected.activities || [];
            activityNames.forEach((name) => {
                const opt = activitySection.options.find((o) => o.label === name);
                if (opt) {
                    finalSelectedActivities.push({ name, ids: opt.ids });
                }
            });
        }
        dispatch(setSelectedActivities(finalSelectedActivities));

        if (onApply) {
            const selectedIds: Record<string, any> = {};
            Object.entries(selected).forEach(([sectionKey, selectedNames]) => {
                const section = sections.find(
                    (s) => ('key' in s && s.key ? s.key : s.title) === sectionKey,
                );
                if (section && 'options' in section) {
                    const allIds: number[] = [];
                    selectedNames.forEach((name) => {
                        const option = section.options.find((opt) => opt.label === name);
                        if (option) allIds.push(...option.ids);
                    });
                    selectedIds[sectionKey] = allIds;
                }
            });
            selectedIds.instantBooking = stickyToggles.some(
                (t) => t.key === 'instant_booking' && t.enabled,
            );
            onApply(selectedIds);
        }
        if (!persistOnApply) setOpen(false);
    }, [onApply, selected, sections, stickyToggles, persistOnApply, setOpen, categories, dispatch, onCategoryChange]);

    return (
        <Sheet open={effectiveOpen} onOpenChange={setOpen}>
            {!isControlled && (
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        className="rounded-full px-4 py-2 h-auto flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" /> {triggerLabel}
                    </Button>
                </SheetTrigger>
            )}
            <SheetContent
                side="right"
                className={`w-full sm:w-[480px] flex flex-col h-full ${contentClassName ?? ''}`}
            >
                <SheetHeader className="px-8 py-4">
                    <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" /> {title}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="h-8 w-8 rounded-full hover:bg-gray-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto space-y-6 ">
                    {enableCategorySelection && (
                        <div className="space-y-3 pb-4 border-b">
                            <div className="px-6">
                                <div className="font-medium text-base">
                                    Choose your <span className="text-[#F6CD28]">Categories</span>
                                </div>
                                {categoriesLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="ml-2">Loading categories...</span>
                                    </div>
                                ) : categories.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 py-4">
                                        {categories.map((category) => {
                                            const checked = (selected.categories || []).includes(category.name);
                                            return (
                                                <label
                                                    key={category.id}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={() =>
                                                            handleCategoryToggle(category.id)
                                                        }
                                                        className="hover:cursor-pointer"
                                                    />
                                                    <span className="text-sm">{category.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">
                                        No categories available
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {sectionsLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading filters...</span>
                        </div>
                    ) : sections.length > 0 ? (
                        <Accordion type="multiple" defaultValue={defaultAccordionOpen}>
                            {sections.map((section) => {
                                const sectionKey =
                                    'key' in section && section.key ? section.key : section.title;
                                if ('render' in section) {
                                    const selectedNames = selected[sectionKey] ?? [];
                                    return (
                                        <AccordionItem value={sectionKey} key={sectionKey}>
                                            <AccordionTrigger className="font-medium text-base px-4 flex items-center">
                                                <span>
                                                    {section.title}{' '}
                                                    <span className="text-[#F6CD28]">
                                                        {section.titleHighlighted}
                                                    </span>
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4">
                                                {section.render({
                                                    selectedNames,
                                                    toggleOption: (name) =>
                                                        toggleOption(sectionKey, name),
                                                })}
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                }
                                const options: FilterOption[] =
                                    'options' in section ? section.options : [];
                                return (
                                    <AccordionItem value={sectionKey} key={sectionKey}>
                                        <AccordionTrigger className="font-medium text-base px-4 flex items-center">
                                            <span>
                                                {section.title}{' '}
                                                <span className="text-[#F6CD28]">
                                                    {section.titleHighlighted}
                                                </span>
                                            </span>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-4">
                                            <div className={`grid ${gridCols} gap-3 py-2`}>
                                                {options.map((opt) => {
                                                    const isChecked =
                                                        selected[sectionKey]?.includes(opt.label) ??
                                                        false;
                                                    return (
                                                        <label
                                                            key={`${sectionKey}-${opt.label}`}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={() =>
                                                                    toggleOption(
                                                                        sectionKey,
                                                                        opt.label,
                                                                        opt.ids,
                                                                    )
                                                                }
                                                                className="hover:cursor-pointer"
                                                            />
                                                            <span className="text-sm">
                                                                {opt.label}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    ) : null}
                </div>

                {stickyToggles.length > 0 && (
                    <div className="border-t p-4 space-y-3">
                        {stickyToggles.map((toggle, index) => (
                            <label
                                key={toggle.key}
                                className="flex items-start gap-3 cursor-pointer"
                            >
                                <Checkbox
                                    checked={toggle.enabled}
                                    onCheckedChange={(checked) =>
                                        setStickyToggles((prev) =>
                                            prev.map((t, i) =>
                                                i === index
                                                    ? { ...t, enabled: checked === true }
                                                    : t,
                                            ),
                                        )
                                    }
                                    className="mt-1 hover:cursor-pointer"
                                />

                                <div className="flex flex-col">
                                    <div className="flex gap-2">
                                        <Instant />
                                        <span className="font-medium text-sm"> {toggle.label}</span>
                                    </div>
                                    {toggle.description && (
                                        <span className="text-xs text-gray-500">
                                            {toggle.description}
                                        </span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 p-4 border-t">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={resetAll}
                        disabled={totalSelected === 0}
                    >
                        Reset {totalSelected > 0 && `(${totalSelected})`}
                    </Button>
                    <Button
                        className="flex-1 bg-[#F6CD28] hover:bg-yellow-500 text-black font-medium"
                        onClick={handleApply}
                    >
                        {totalSelected > 0 && typeof resultCount === 'number'
                            ? `View ${resultCount} Space${resultCount !== 1 ? 's' : ''}`
                            : 'View Spaces'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
