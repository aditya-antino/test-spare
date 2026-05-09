"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";

// ============ Types ============
export type FilterOption = { label: string; value: string };
export type FilterSection =
  | {
      /** Section title shown in the UI */
      title: string;
      /** Options for this section (array of strings or {label,value}) */
      options: (string | FilterOption)[];
      /** Optional unique key; if omitted, title will be used */
      key?: string;
    }
  | {
      /** When you want a fully custom body inside an accordion item */
      title: string;
      key?: string;
      /** Provide a custom renderer; receive current selection + setter */
      render: (ctx: {
        selected: Record<string, string[]>;
        toggleValue: (sectionKey: string, value: string) => void;
      }) => React.ReactNode;
    };

export type StickyToggle = {
  /** Unique key used in `selected` map */
  key: string;
  /** Label shown to the user */
  label: string;
  /** Optional description below the label */
  description?: string;
  /** When true, this toggle shows in the sticky area (outside Accordion) */
  enabled?: boolean;
  /** Single fixed value stored when checked (defaults to "true") */
  value?: string;
};

export type FilterSidebarProps = {
  /** Sections that will be rendered inside the accordion */
  sections?: FilterSection[];
  /** Toggles shown below the accordion (e.g., Instant Booking) */
  stickyToggles?: StickyToggle[];
  /** External count to show in the CTA when something is selected */
  resultCount?: number;
  /** Whether the sidebar is open */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Title in the sidebar header */
  title?: string;
  /** Initial selected map, useful for hydrating from URL/search params */
  initialSelected?: Record<string, string[]>;
  /** Called when user clicks Apply/ View Spaces */
  onApply?: (selected: Record<string, string[]>) => void;
  /** Called on any change in selection (debounced/instant as you wish) */
  onChange?: (selected: Record<string, string[]>) => void;
  /** Grid columns for options (defaults to 4) */
  optionCols?: 1 | 2 | 3 | 4;
  /** Enable category selection mode */
  enableCategorySelection?: boolean;
  /** Categories for selection */
  categories?: Array<{ id: number; name: string }>;
  /** Selected category ID */
  selectedCategoryId?: number;
  /** Called when category selection changes */
  onCategoryChange?: (categoryId: number | null) => void;
  /** Loading state for categories */
  categoriesLoading?: boolean;
  /** Loading state for sections */
  sectionsLoading?: boolean;
};

export default function FilterSidebar({
  sections = [],
  stickyToggles = [
    {
      key: "instant_booking",
      label: "Instant Booking",
      description:
        "Show only spaces that can be booked immediately without host approval.",
      enabled: true,
      value: "instant",
    },
  ],
  resultCount,
  open = true,
  onOpenChange,
  title = "Filters",
  initialSelected,
  onApply,
  onChange,
  optionCols = 4,
  enableCategorySelection = false,
  categories = [],
  selectedCategoryId,
  onCategoryChange,
  categoriesLoading = false,
  sectionsLoading = false,
}: FilterSidebarProps) {
  const [selected, setSelected] = React.useState<Record<string, string[]>>(
    initialSelected ?? {}
  );

  const toggleValue = React.useCallback(
    (sectionKey: string, value: string) => {
      setSelected((prev) => {
        const prevArr = prev[sectionKey] ?? [];
        const nextSet = new Set(prevArr);
        if (nextSet.has(value)) nextSet.delete(value);
        else nextSet.add(value);
        const next = { ...prev, [sectionKey]: Array.from(nextSet) };
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const resetAll = React.useCallback(() => {
    setSelected({});
    onChange?.({});
  }, [onChange]);

  const totalSelected = React.useMemo(
    () => Object.values(selected).reduce((a, b) => a + b.length, 0),
    [selected]
  );

  const gridCols =
    optionCols === 1
      ? "grid-cols-1"
      : optionCols === 2
      ? "grid-cols-2"
      : optionCols === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  const defaultAccordionOpen = React.useMemo(
    () => sections.map((s) => ("key" in s && s.key ? s.key : s.title)),
    [sections]
  );

  if (!open) return null;

  return (
    <div className="w-full bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-120px)] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        {onOpenChange && (
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="p-6 space-y-8">
          {/* Category Selection */}
          {enableCategorySelection && (
            <div className="space-y-3">
              <div className="font-medium text-base text-gray-900">Select Category</div>
              <Select
                value={selectedCategoryId?.toString() || ""}
                onValueChange={(value) => onCategoryChange?.(value ? parseInt(value) : null)}
                disabled={categoriesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a category to see filters" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading categories...</span>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter Sections */}
          {sectionsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading filters...</span>
            </div>
          ) : sections.length > 0 ? (
            <Accordion type="multiple" defaultValue={defaultAccordionOpen}>
              {sections.map((section) => {
                const sectionKey = "key" in section && section.key
                  ? section.key
                  : section.title;

                // custom render section
                if ("render" in section && typeof section.render === "function") {
                  return (
                    <AccordionItem value={sectionKey} key={sectionKey} className="border-none">
                      <AccordionTrigger className="font-medium text-base text-gray-900 hover:no-underline py-4 px-0">
                        <div className="flex items-center justify-between w-full">
                          <span>{section.title}</span>
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 px-0">
                        <div className="max-h-64 overflow-y-auto">
                          {section.render({ selected, toggleValue })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                }

                // standard options section
                const options = ("options" in section ? section.options : []).map((o) =>
                  typeof o === "string" ? { label: o, value: o } : o
                );

                return (
                  <AccordionItem value={sectionKey} key={sectionKey} className="border-none">
                    <AccordionTrigger className="font-medium text-base text-gray-900 hover:no-underline py-4 px-0">
                      <div className="flex items-center justify-between w-full">
                        <span>{section.title}</span>
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 px-0">
                      <div className="max-h-64 overflow-y-auto">
                        <div className={`grid ${gridCols} gap-3 py-2`}>
                          {options.map((opt) => {
                            const checked =
                              selected[sectionKey]?.includes(opt.value) ?? false;
                            return (
                              <label
                                key={`${sectionKey}-${opt.value}`}
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() =>
                                    toggleValue(sectionKey, opt.value)
                                  }
                                  className="data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] border-gray-300"
                                />
                                <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : enableCategorySelection ? (
            <div className="text-center text-gray-500 py-8">
              Please select a category to see available filters
            </div>
          ) : null}

          {/* Sticky toggles */}
          {stickyToggles
            .filter((t) => t.enabled !== false)
            .map((t) => {
              const v = t.value ?? "true";
              const checked = selected[t.key]?.includes(v) ?? false;
              return (
                <div className="border-t border-gray-200 pt-6" key={t.key}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleValue(t.key, v)}
                      className="data-[state=checked]:bg-[#F6CD28] data-[state=checked]:border-[#F6CD28] border-gray-300 mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{t.label}</div>
                      {t.description && (
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50" 
          onClick={resetAll}
        >
          Reset
        </Button>
        <Button
          className="flex-1 bg-[#F6CD28] hover:bg-yellow-500 text-black font-medium border-0"
          onClick={() => {
            onApply?.(selected);
          }}
        >
          {`View ${
            totalSelected > 0 && typeof resultCount === "number"
              ? `${resultCount} Spaces`
              : "Spaces"
          }`}
        </Button>
      </div>
    </div>
  );
}
