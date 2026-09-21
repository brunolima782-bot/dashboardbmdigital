"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar } from "lucide-react";
import { PERIOD_LABELS, PeriodPreset } from "@/lib/period";

const OPTIONS: PeriodPreset[] = ["today", "last7", "last30", "thisMonth", "lastMonth", "custom"];

export default function PeriodSelector({ current }: { current: PeriodPreset }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriod(preset: PeriodPreset) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", preset);
    if (preset !== "custom") {
      params.delete("start");
      params.delete("end");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function setCustomDate(key: "start" | "end", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "custom");
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 overflow-x-auto">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setPeriod(opt)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              current === opt
                ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {PERIOD_LABELS[opt]}
          </button>
        ))}
      </div>
      {current === "custom" && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            className="input py-1.5 text-xs"
            defaultValue={searchParams.get("start") || ""}
            onChange={(e) => setCustomDate("start", e.target.value)}
          />
          <span className="text-slate-400 text-xs">até</span>
          <input
            type="date"
            className="input py-1.5 text-xs"
            defaultValue={searchParams.get("end") || ""}
            onChange={(e) => setCustomDate("end", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
