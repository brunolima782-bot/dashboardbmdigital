import { prisma } from "@/lib/prisma";
import FinanceiroClient from "@/components/finance/FinanceiroClient";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const now = new Date();
  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth() + 1;
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const [settings, revenues, expenses, activeClients, clients] = await Promise.all([
    prisma.agencySettings.findFirst(),
    prisma.agencyRevenue.findMany({
      where: { date: { gte: start, lte: end } },
      include: { client: { select: { companyName: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.agencyExpense.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "desc" },
    }),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
  ]);

  return (
    <FinanceiroClient
      month={month}
      year={year}
      revenues={revenues}
      expenses={expenses}
      activeClients={activeClients}
      clients={clients}
      reservePercent={settings?.reservePercent ?? 30}
      clientGoalCount={settings?.clientGoalCount ?? 5}
      clientGoalTicket={settings?.clientGoalTicket ?? 1500}
    />
  );
}
