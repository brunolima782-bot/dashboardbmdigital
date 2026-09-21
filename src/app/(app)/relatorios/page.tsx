import { prisma } from "@/lib/prisma";
import ReportSelectorClient from "@/components/reports/ReportSelectorClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true },
  });

  return <ReportSelectorClient clients={clients} />;
}
