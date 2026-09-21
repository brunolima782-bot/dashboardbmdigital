import { prisma } from "@/lib/prisma";
import ClientsListClient from "@/components/clients/ClientsListClient";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const clients = await prisma.client.findMany({ orderBy: { companyName: "asc" } });

  const clientsWithInvestment = await Promise.all(
    clients.map(async (c) => {
      const investments = await prisma.investment.findMany({
        where: { clientId: c.id, date: { gte: monthStart, lte: monthEnd } },
        select: { amount: true },
      });
      return {
        id: c.id,
        companyName: c.companyName,
        contactName: c.contactName,
        segment: c.segment,
        city: c.city,
        state: c.state,
        logoUrl: c.logoUrl,
        brandColor: c.brandColor,
        status: c.status as "ACTIVE" | "INACTIVE",
        monthlyInvestment: investments.reduce((s, i) => s + i.amount, 0),
      };
    })
  );

  return <ClientsListClient clients={clientsWithInvestment} />;
}
