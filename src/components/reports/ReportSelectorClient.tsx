"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileBarChart, ArrowRight } from "lucide-react";
import { PERIOD_LABELS, PeriodPreset } from "@/lib/period";
import type { ClientOption } from "@/components/investments/InvestmentFormModal";

const PERIODS: PeriodPreset[] = ["today", "last7", "last30", "thisMonth", "lastMonth", "custom"];
const PLATFORM_OPTIONS = [
  { value: "META", label: "Meta Ads" },
  { value: "GOOGLE", label: "Google Ads" },
  { value: "LINKEDIN", label: "LinkedIn Ads" },
];

export default function ReportSelectorClient({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState(searchParams.get("clientId") || "");
  const [period, setPeriod] = useState<PeriodPreset>("thisMonth");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["META", "GOOGLE", "LINKEDIN"]);

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function handleGenerate() {
    if (!clientId) return;
    const params = new URLSearchParams();
    params.set("period", period);
    if (period === "custom") {
      if (start) params.set("start", start);
      if (end) params.set("end", end);
    }
    params.set("platforms", platforms.join(","));
    router.push(`/relatorios/${clientId}?${params.toString()}`);
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Relatórios</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Selecione o cliente, período e plataformas para gerar um relatório de performance profissional.
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="label">Cliente *</label>
          <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Selecione o cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Período</label>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <div className="mt-3 flex items-center gap-2">
              <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
              <span className="text-slate-400 text-sm">até</span>
              <input type="date" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          )}
        </div>

        <div>
          <label className="label">Plataformas</label>
          <div className="flex flex-wrap gap-3">
            {PLATFORM_OPTIONS.map((p) => (
              <label key={p.value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={platforms.includes(p.value)}
                  onChange={() => togglePlatform(p.value)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button className="btn-primary" onClick={handleGenerate} disabled={!clientId}>
            <FileBarChart className="h-4 w-4" /> Gerar relatório <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
