"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/formatters";

export type TrendDatum = { label: string; value: number };
export type TrendFormat = "currency" | "number";

export default function TrendLineChart({
  data,
  color = "#4f46e5",
  format = "number",
}: {
  data: TrendDatum[];
  color?: string;
  format?: TrendFormat;
}) {
  const valueFormatter = (v: number) => (format === "currency" ? formatCurrency(v) : formatNumber(v));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Sem dados suficientes para exibir a evolução.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : String(v))}
        />
        <Tooltip
          formatter={(value: number) => (valueFormatter ? valueFormatter(value) : String(value))}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
