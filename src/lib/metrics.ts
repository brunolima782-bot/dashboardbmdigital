export type MetricRow = {
  amount: number;
  impressions?: number | null;
  reach?: number | null;
  clicks?: number | null;
  leads?: number | null;
  conversions?: number | null;
  conversionValue?: number | null;
};

export type AggregatedMetrics = {
  investment: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  conversionValue: number;
  ctr: number; // %
  cpc: number; // R$
  cpm: number; // R$
  cpl: number; // R$
  cpa: number; // R$ custo por conversão
  roas: number; // razão
};

export function aggregateMetrics(rows: MetricRow[]): AggregatedMetrics {
  const totals = rows.reduce(
    (acc, r) => {
      acc.investment += r.amount || 0;
      acc.impressions += r.impressions || 0;
      acc.reach += r.reach || 0;
      acc.clicks += r.clicks || 0;
      acc.leads += r.leads || 0;
      acc.conversions += r.conversions || 0;
      acc.conversionValue += r.conversionValue || 0;
      return acc;
    },
    {
      investment: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      leads: 0,
      conversions: 0,
      conversionValue: 0,
    }
  );

  return {
    ...totals,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks > 0 ? totals.investment / totals.clicks : 0,
    cpm: totals.impressions > 0 ? (totals.investment / totals.impressions) * 1000 : 0,
    cpl: totals.leads > 0 ? totals.investment / totals.leads : 0,
    cpa: totals.conversions > 0 ? totals.investment / totals.conversions : 0,
    roas: totals.investment > 0 ? totals.conversionValue / totals.investment : 0,
  };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // null = variação indisponível (sem base de comparação)
  return ((current - previous) / previous) * 100;
}

export const PLATFORM_LABELS: Record<string, string> = {
  META: "Meta Ads",
  GOOGLE: "Google Ads",
  LINKEDIN: "LinkedIn Ads",
};

export const PLATFORM_COLORS: Record<string, string> = {
  META: "#1877F2",
  GOOGLE: "#34A853",
  LINKEDIN: "#0A66C2",
};
