export type PeriodPreset =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  today: "Hoje",
  last7: "Últimos 7 dias",
  last30: "Últimos 30 dias",
  thisMonth: "Este mês",
  lastMonth: "Mês anterior",
  custom: "Período personalizado",
};

function startOfDay(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function endOfDay(d: Date) {
  const n = new Date(d);
  n.setHours(23, 59, 59, 999);
  return n;
}

export function resolvePeriod(
  preset: PeriodPreset,
  customStart?: string | null,
  customEnd?: string | null
): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
  const now = new Date();

  switch (preset) {
    case "today": {
      const start = startOfDay(now);
      const end = endOfDay(now);
      const previousStart = startOfDay(new Date(now.getTime() - 86400000));
      const previousEnd = endOfDay(new Date(now.getTime() - 86400000));
      return { start, end, previousStart, previousEnd };
    }
    case "last7": {
      const end = endOfDay(now);
      const start = startOfDay(new Date(now.getTime() - 6 * 86400000));
      const previousEnd = endOfDay(new Date(start.getTime() - 86400000));
      const previousStart = startOfDay(new Date(previousEnd.getTime() - 6 * 86400000));
      return { start, end, previousStart, previousEnd };
    }
    case "last30": {
      const end = endOfDay(now);
      const start = startOfDay(new Date(now.getTime() - 29 * 86400000));
      const previousEnd = endOfDay(new Date(start.getTime() - 86400000));
      const previousStart = startOfDay(new Date(previousEnd.getTime() - 29 * 86400000));
      return { start, end, previousStart, previousEnd };
    }
    case "lastMonth": {
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      const previousStart = startOfDay(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      const previousEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 0));
      return { start, end, previousStart, previousEnd };
    }
    case "custom": {
      const start = customStart ? startOfDay(new Date(customStart)) : startOfDay(now);
      const end = customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now);
      const diff = end.getTime() - start.getTime();
      const previousEnd = endOfDay(new Date(start.getTime() - 86400000));
      const previousStart = startOfDay(new Date(previousEnd.getTime() - diff));
      return { start, end, previousStart, previousEnd };
    }
    case "thisMonth":
    default: {
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      const end = endOfDay(now);
      const previousStart = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const previousEnd = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { start, end, previousStart, previousEnd };
    }
  }
}
