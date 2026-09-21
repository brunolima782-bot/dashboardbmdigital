import { aggregateMetrics, percentChange, PLATFORM_LABELS, type MetricRow } from "@/lib/metrics";

export type PlatformBreakdown = { platform: string; rows: MetricRow[] };

/**
 * Gera insights e recomendações estritamente a partir dos dados fornecidos.
 * Nunca inventa números: cada frase referencia apenas totais calculados aqui.
 */
export function generateInsights(
  currentByPlatform: PlatformBreakdown[],
  currentTotal: MetricRow[],
  previousTotal: MetricRow[]
): string[] {
  const insights: string[] = [];
  const current = aggregateMetrics(currentTotal);
  const previous = aggregateMetrics(previousTotal);

  if (current.investment === 0) {
    return ["Ainda não há investimentos registrados neste período para gerar insights."];
  }

  // Participação de cada plataforma no investimento total
  const platformTotals = currentByPlatform
    .map((p) => ({ platform: p.platform, agg: aggregateMetrics(p.rows) }))
    .filter((p) => p.agg.investment > 0)
    .sort((a, b) => b.agg.investment - a.agg.investment);

  if (platformTotals.length > 0) {
    const top = platformTotals[0];
    const share = (top.agg.investment / current.investment) * 100;
    if (share >= 40) {
      insights.push(
        `${PLATFORM_LABELS[top.platform] ?? top.platform} concentrou ${share.toLocaleString("pt-BR", {
          maximumFractionDigits: 0,
        })}% do investimento total no período.`
      );
    }
  }

  // Participação de leads por plataforma
  const leadTotals = currentByPlatform
    .map((p) => ({ platform: p.platform, agg: aggregateMetrics(p.rows) }))
    .filter((p) => p.agg.leads > 0)
    .sort((a, b) => b.agg.leads - a.agg.leads);

  if (leadTotals.length > 0 && current.leads > 0) {
    const top = leadTotals[0];
    const share = (top.agg.leads / current.leads) * 100;
    insights.push(
      `${PLATFORM_LABELS[top.platform] ?? top.platform} gerou ${share.toLocaleString("pt-BR", {
        maximumFractionDigits: 0,
      })}% dos leads registrados no período (${top.agg.leads} de ${current.leads}).`
    );
  }

  // Variação de CPL em relação ao período anterior
  if (previous.leads > 0 && current.leads > 0) {
    const cplChange = percentChange(current.cpl, previous.cpl);
    if (cplChange !== null && Math.abs(cplChange) >= 3) {
      const direction = cplChange < 0 ? "redução" : "aumento";
      insights.push(
        `O custo por lead apresentou ${direction} de ${Math.abs(cplChange).toLocaleString("pt-BR", {
          maximumFractionDigits: 1,
        })}% em relação ao período anterior.`
      );
    }
  }

  // Variação de investimento
  if (previous.investment > 0) {
    const invChange = percentChange(current.investment, previous.investment);
    if (invChange !== null && Math.abs(invChange) >= 3) {
      const direction = invChange > 0 ? "aumento" : "redução";
      insights.push(
        `O investimento total teve ${direction} de ${Math.abs(invChange).toLocaleString("pt-BR", {
          maximumFractionDigits: 1,
        })}% comparado ao período anterior.`
      );
    }
  }

  // CTR geral
  if (current.impressions > 0) {
    insights.push(
      `A taxa de cliques (CTR) média do período foi de ${current.ctr.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
      })}%.`
    );
  }

  if (insights.length === 0) {
    insights.push("Os dados do período ainda são insuficientes para gerar insights comparativos relevantes.");
  }

  return insights;
}

export function generateExecutiveSummary(
  totalRows: MetricRow[],
  activePlatforms: string[]
): string {
  const totals = aggregateMetrics(totalRows);

  if (totals.investment === 0) {
    return "Não foram registrados investimentos no período selecionado para este cliente.";
  }

  const platformNames = activePlatforms.map((p) => PLATFORM_LABELS[p] ?? p);
  const platformsText =
    platformNames.length === 0
      ? ""
      : platformNames.length === 1
      ? platformNames[0]
      : `${platformNames.slice(0, -1).join(", ")} e ${platformNames[platformNames.length - 1]}`;

  const investmentText = totals.investment.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  let summary = `Durante o período analisado, foram investidos ${investmentText} em mídia paga`;
  if (platformsText) summary += `, distribuídos entre ${platformsText}`;
  summary += ".";

  if (totals.leads > 0) {
    const cplText = totals.cpl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    summary += ` As campanhas geraram ${totals.leads} lead${totals.leads !== 1 ? "s" : ""}, com custo médio de ${cplText} por lead.`;
  }

  if (totals.conversions > 0) {
    const conversionWord = totals.conversions !== 1 ? "conversões" : "conversão";
    summary += ` Foram registradas ${totals.conversions} ${conversionWord}${
      totals.roas > 0 ? `, com ROAS de ${totals.roas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}x` : ""
    }.`;
  }

  return summary;
}

export function generateRecommendations(
  currentTotal: MetricRow[],
  previousTotal: MetricRow[]
): string[] {
  const recs: string[] = [];
  const current = aggregateMetrics(currentTotal);
  const previous = aggregateMetrics(previousTotal);

  if (current.investment === 0) {
    return ["Registre investimentos neste período para receber recomendações baseadas em dados."];
  }

  if (previous.leads > 0 && current.leads > 0) {
    const cplChange = percentChange(current.cpl, previous.cpl);
    if (cplChange !== null && cplChange > 10) {
      recs.push(
        "O custo por lead aumentou em relação ao período anterior. Recomenda-se revisar criativos, segmentação e distribuição de orçamento entre as plataformas."
      );
    } else if (cplChange !== null && cplChange < -10) {
      recs.push(
        "O custo por lead reduziu de forma consistente. Recomenda-se avaliar o aumento gradual de orçamento nas campanhas com melhor desempenho."
      );
    }
  }

  if (current.ctr > 0 && current.ctr < 1) {
    recs.push(
      "O CTR do período está abaixo de 1%. Pode ser interessante testar novos criativos ou revisar a segmentação de público."
    );
  }

  if (current.leads > 0 && current.conversions === 0) {
    recs.push(
      "Foram registrados leads, mas nenhuma conversão no período. Recomenda-se avaliar o processo comercial de follow-up dos leads gerados."
    );
  }

  if (current.roas > 0 && current.roas < 1) {
    recs.push(
      "O ROAS do período está abaixo de 1, indicando que o retorno direto pode estar inferior ao investimento. Recomenda-se revisão de metas e funil de conversão."
    );
  }

  if (recs.length === 0) {
    recs.push(
      "Os indicadores do período estão dentro da normalidade. Recomenda-se manter o acompanhamento contínuo e testes controlados de criativos e segmentações."
    );
  }

  return recs;
}
