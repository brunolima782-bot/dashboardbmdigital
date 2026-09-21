"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/metrics";

export type PlatformDatum = { platform: string; value: number };

export default function PlatformPieChart({ data }: { data: PlatformDatum[] }) {
  const chartData = data.filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Sem investimentos registrados no período.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="platform"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value), PLATFORM_LABELS[name] || name]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Legend
          formatter={(value: string) => PLATFORM_LABELS[value] || value}
          wrapperStyle={{ fontSize: 13 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
