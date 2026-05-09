"use client";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar"; // shadcn calendar
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addMinutes, format } from "date-fns";

export type DateRangeValue = { start?: Date; end?: Date };

export function DateTimeRangeContent({
  value,
  onApply,
  onCancel,
}: {
  value?: DateRangeValue;
  onApply: (next: DateRangeValue) => void;
  onCancel?: () => void;
}) {
  const [day, setDay] = React.useState<Date | undefined>(value?.start ?? new Date());
  const [startTime, setStartTime] = React.useState<string>(() =>
    value?.start ? format(value.start, "HH:mm") : "09:00"
  );
  const [endTime, setEndTime] = React.useState<string>(() =>
    value?.end ? format(value.end, "HH:mm") : "17:00"
  );

  React.useEffect(() => {
    if (value?.start) {
      setDay(value.start);
      setStartTime(format(value.start, "HH:mm"));
    }
    if (value?.end) setEndTime(format(value.end, "HH:mm"));
  }, [value?.start, value?.end]);

  const buildDate = (base?: Date, hm = "00:00") => {
    if (!base) return undefined;
    const [h, m] = hm.split(":").map(Number);
    const d = new Date(base);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const start = buildDate(day, startTime);
  const end = buildDate(day, endTime);

  return (
    <div
      className="inline-flex flex-col justify-center items-center rounded-2xl shadow-[0_10px_10px_rgba(0,0,0,0.04),0_20px_25px_rgba(0,0,0,0.1)] 
                 backdrop-blur-[32px] bg-white overflow-hidden"
    >
      {/* Calendar Section */}
      <div className="flex px-z flex-col items-center self-stretch">
        <Calendar
          mode="single"
          selected={day}
          onSelect={(d) => d && setDay(d)}
          initialFocus
          className="w-full"
        />
      </div>

      {/* From / To Section */}
      <div className="flex items-center justify-center gap-6 px-4 py-6 border-t border-[#D5D5D5] bg-white w-full">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">From</div>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-[140px] text-center"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">To</div>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-[140px] text-center"
          />
        </div>
      </div>

      {/* Footer (Cancel + Apply) */}
      <div className="flex px-4 py-3 justify-end items-center gap-6 self-stretch rounded-b-2xl bg-white border-t border-[#D5D5D5]">
        
          <Button
            variant="outline"
            className="px-4 py-2 rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </Button>
    
        <Button
          className="px-4 py-2 rounded-lg bg-[#F6CD28] hover:bg-yellow-500 text-black font-medium"
          onClick={() => {
            const s = start ?? new Date();
            const e = end ?? addMinutes(s, 60);
            onApply({ start: s, end: e });
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
