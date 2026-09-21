import { prisma } from "@/lib/prisma";
import InvestmentsPageClient from "@/components/investments/InvestmentsPageClient";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  return <InvestmentsPageClient clients={clients} />;
}
