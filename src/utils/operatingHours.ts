import dayjs from "dayjs";

const WEEKDAY_MAP = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const;

type AutoBlock = {
  id: string;                // e.g. "auto-2025-09-11"
  startDatetime: string;     // ISO
  endDatetime: string;       // ISO
  status: 'blocked';
  readonly: true;            // mark as auto (non-deletable)
  source: 'operatingHours';
};

// normalize access: handles "Monday" or "monday"
const getDayConf = (slots: any, dayName: string) => {
  if (!slots) return undefined;
  return slots[dayName] ?? slots[dayName.toLowerCase()] ?? slots[dayName.toUpperCase()];
};

export default function generateClosedDayBlocksFromSlots(
  slots: any | undefined,
  startISO: string,
  endISO: string
): AutoBlock[] {
  if (!slots || !startISO || !endISO) return [];
  let cursor = dayjs(startISO);
  const end = dayjs(endISO);
  const out: AutoBlock[] = [];

  while (cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')) {
    const dayName = WEEKDAY_MAP[cursor.day()];
    const conf = getDayConf(slots, dayName);

    // auto-block when explicitly closed
    if (conf && conf.is_open === false) {
      const start = cursor.tz('Asia/Kolkata').startOf('day').toISOString();
      const finish = cursor.tz('Asia/Kolkata').endOf('day').toISOString();
      out.push({
        id: `auto-${cursor.format('YYYY-MM-DD')}`,
        startDatetime: start,
        endDatetime: finish,
        status: 'blocked',
        readonly: true,
        source: 'operatingHours',
      });
    }

    cursor = cursor.add(1, 'day');
  }
  return out;
}
