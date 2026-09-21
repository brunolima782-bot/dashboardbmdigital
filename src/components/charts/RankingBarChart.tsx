"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/formatters";

export type RankingDatum = { name: string; value: number; color?: string };

export default function RankingBarChart({ data }: { data: RankingDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Nenhuma campanha registrada no período.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 40)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
          width={160}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {sorted.map((entry, idx) => (
            <Cell key={idx} fill={entry.color || "#4f46e5"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
