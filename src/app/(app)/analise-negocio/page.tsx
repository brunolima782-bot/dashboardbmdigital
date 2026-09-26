import { prisma } from "@/lib/prisma";
import BusinessAnalysisSelector from "@/components/business/BusinessAnalysisSelector";

export const dynamic = "force-dynamic";

export default async function BusinessAnalysisIndexPage() {
  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, segment: true, businessProfile: { select: { id: true } } },
  });

  return <BusinessAnalysisSelector clients={clients} />;
}
