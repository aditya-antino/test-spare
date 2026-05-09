"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendeesStepperContent } from "./customFilterPills/AttendeeStepper";
import { PriceRangeContent } from "./customFilterPills/PriceRangeStepper";
import { DateTimeRangeContent } from "./customFilterPills/CalendarTimePill";

/* ---------------------------------- Types ---------------------------------- */

export type FilterOption = { label: React.ReactNode; value: string; disabled?: boolean };

type BaseProps = {
  className?: string;
  contentClassName?: string;
  placeholder?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  buttonProps?: React.ComponentProps<typeof Button>;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
};

type SingleSelectProps = BaseProps & {
  triggerMode?: "dropdown";
  multiple?: false;
  options: FilterOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
};

type MultiSelectProps = BaseProps & {
  triggerMode?: "dropdown";
  multiple: true;
  options: FilterOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  maxVisibleTags?: number;
};

type ExternalTriggerProps = BaseProps & {
  triggerMode: "external";
  onTrigger: () => void;
};

type CustomContentProps = BaseProps & {
  triggerMode: "custom";
  /** either pass `content` directly, or use `custom` with one of the built-ins */
  content?: React.ReactNode;
  custom?:
    | { type: "attendees"; value?: number; onApply: (v: number) => void }
    | { type: "price"; value?: { min?: number; max?: number }; onApply: (v: { min?: number; max?: number }) => void }
    | { type: "datetime"; value?: { start?: Date; end?: Date }; onApply: (v: { start?: Date; end?: Date }) => void };
};

export type FilterPillProps =
  | SingleSelectProps
  | MultiSelectProps
  | ExternalTriggerProps
  | CustomContentProps;

/* --------------------------------- Button ---------------------------------- */

const PillBtn = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, children, ...rest }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      {...rest}
      className={cn(
        "rounded-full h-auto px-4 py-2 border border-input shadow-sm",
        "text-sm font-medium flex items-center gap-2 hover:bg-muted/50",
        className
      )}
    >
      {children}
    </Button>
  )
);
PillBtn.displayName = "PillBtn";

/* -------------------------------- Component -------------------------------- */

const FilterPill = (props: FilterPillProps) => {
  /* ----------------------------- External trigger ---------------------------- */
  if (props.triggerMode === "external") {
    return (
      <PillBtn {...props.buttonProps} onClick={props.onTrigger}>
        {props.leftIcon}
        <span className="truncate">{props.placeholder ?? "Select"}</span>
        {props.rightIcon ?? null}
      </PillBtn>
    );
  }

  /* -------------------------------- Custom mode ------------------------------ */
  if (props.triggerMode === "custom") {
    const { custom, content, placeholder = "Select", leftIcon, rightIcon, buttonProps, className } = props;
    const [open, setOpen] = React.useState(false);

   let resolvedContent = content;
    if (!resolvedContent && custom) {
      if (custom.type === "attendees") {
        resolvedContent = (
          <AttendeesStepperContent
            value={custom.value}
            onApply={(v) => {
              custom.onApply(v);
              setOpen(false);
            }}
          />
        );
      } else if (custom.type === "price") {
        resolvedContent = (
          <PriceRangeContent
            value={custom.value}
            onApply={(v) => {
              custom.onApply(v);
              setOpen(false);
            }}
          />
        );
      } else if (custom.type === "datetime") {
        resolvedContent = (
          <DateTimeRangeContent
            value={custom.value}
            onApply={(v) => {
              custom.onApply(v);
              setOpen(false);
            }}
          />
        );
      }
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <PillBtn {...buttonProps} className={cn(className, buttonProps?.className)}>
            {leftIcon}
            <span className="truncate">{placeholder}</span>
            {rightIcon ?? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
          </PillBtn>
        </PopoverTrigger>
        <PopoverContent className={cn("rounded-xl", props.contentClassName)}>{resolvedContent}</PopoverContent>
      </Popover>
    );
  }

  /* ------------------------------- Dropdown mode ----------------------------- */
  const { options, multiple, placeholder = "Select", leftIcon, rightIcon, className, buttonProps } = props;

  const [value, setValue] = React.useState<any>(
    multiple ? (props as MultiSelectProps).defaultValue ?? [] : (props as SingleSelectProps).defaultValue
  );

  const selectedLabel = multiple
    ? ((value as string[]) ?? []).join(", ") || placeholder
    : options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillBtn {...buttonProps} className={cn(className, buttonProps?.className)}>
          {leftIcon}
          <span className="truncate">{selectedLabel}</span>
          {rightIcon ?? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
        </PillBtn>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("rounded-lg min-w-[220px]", props.contentClassName)}>
        {multiple
          ? options.map((o) => (
              <DropdownMenuCheckboxItem
                key={o.value}
                checked={(value as string[]).includes(o.value)}
                onCheckedChange={() => {
                  const arr = new Set(value as string[]);
                  arr.has(o.value) ? arr.delete(o.value) : arr.add(o.value);
                  setValue(Array.from(arr));
                  (props as MultiSelectProps).onChange?.(Array.from(arr));
                }}
              >
                {o.label}
              </DropdownMenuCheckboxItem>
            ))
          : options.map((o) => (
              <DropdownMenuItem
                key={o.value}
                onClick={() => {
                  setValue(o.value);
                  (props as SingleSelectProps).onChange?.(o.value);
                }}
              >
                {o.label}
              </DropdownMenuItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterPill;
