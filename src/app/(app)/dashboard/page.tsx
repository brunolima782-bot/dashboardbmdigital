import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { aggregateMetrics } from "@/lib/metrics";
import { formatCurrency, formatNumber, formatMonthYear } from "@/lib/formatters";
import StatCard from "@/components/ui/StatCard";
import ChartCard from "@/components/charts/ChartCard";
import PlatformPieChart from "@/components/charts/PlatformPieChart";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { Wallet, Users, Target, TrendingUp, ArrowRight, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [totalClients, activeClients, investments, clients] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.investment.findMany({ where: { date: { gte: monthStart, lte: monthEnd } } }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totals = aggregateMetrics(investments);
  const byPlatform = ["META", "GOOGLE", "LINKEDIN"].map((platform) => ({
    platform,
    value: investments.filter((i) => i.platform === platform).reduce((sum, i) => sum + i.amount, 0),
  }));

  const clientsWithInvestment = await Promise.all(
    clients.map(async (c) => {
      const inv = investments.filter((i) => i.clientId === c.id);
      return { ...c, monthlyInvestment: inv.reduce((s, i) => s + i.amount, 0) };
    })
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Visão geral da agência</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatMonthYear(now.getMonth() + 1, now.getFullYear())} · dados consolidados de todos os clientes
          </p>
        </div>
        <Link href="/clientes/novo" className="btn-primary">
          <Users className="h-4 w-4" /> Novo cliente
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Investimento total administrado"
          value={formatCurrency(totals.investment)}
          icon={Wallet}
          iconColor="text-brand-600"
          iconBg="bg-brand-50 dark:bg-brand-500/10"
        />
        <StatCard
          label="Clientes ativos"
          value={`${activeClients} de ${totalClients}`}
          icon={Building2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          label="Total de leads no mês"
          value={formatNumber(totals.leads)}
          icon={Target}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />
        <StatCard
          label="CPL médio"
          value={formatCurrency(totals.cpl)}
          icon={TrendingUp}
          iconColor="text-violet-600"
          iconBg="bg-violet-50 dark:bg-violet-950/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 grid grid-cols-1 gap-4">
          <StatCard label="Investimento Meta Ads" value={formatCurrency(byPlatform[0].value)} />
          <StatCard label="Investimento Google Ads" value={formatCurrency(byPlatform[1].value)} />
          <StatCard label="Investimento LinkedIn Ads" value={formatCurrency(byPlatform[2].value)} />
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Investimento por plataforma" subtitle="Todos os clientes · mês atual">
            <PlatformPieChart data={byPlatform} />
          </ChartCard>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Clientes recentes</h3>
          <Link href="/clientes" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {clientsWithInvestment.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Cadastre seu primeiro cliente para começar a acompanhar investimentos em tráfego pago."
            action={
              <Link href="/clientes/novo" className="btn-primary">
                Cadastrar cliente
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {clientsWithInvestment.map((c) => (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                className="flex items-center gap-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-xl transition-colors"
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: c.brandColor }}
                >
                  {c.companyName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.companyName}</p>
                  <p className="text-xs text-slate-400 truncate">{c.segment || "—"} · {c.city || "—"}</p>
                </div>
                <Badge variant={c.status === "ACTIVE" ? "success" : "neutral"}>
                  {c.status === "ACTIVE" ? "Ativo" : "Inativo"}
                </Badge>
                <p className="text-sm font-semibold text-slate-900 dark:text-white w-28 text-right">
                  {formatCurrency(c.monthlyInvestment)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
