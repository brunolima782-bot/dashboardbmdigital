import { prisma } from "@/lib/prisma";
import ProspectListClient from "@/components/business/ProspectListClient";
import { calculateChecklistResult, ChecklistAnswer } from "@/lib/profileChecklist";

export const dynamic = "force-dynamic";

export default async function AnaliseNegocioIndexPage() {
  const prospects = await prisma.prospect.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      businessProfile: { select: { id: true } },
      profileChecklist: { select: { id: true, answers: true } },
    },
  });

  const rows = prospects.map((p) => {
    const answers = (p.profileChecklist?.answers as Record<string, ChecklistAnswer>) || {};
    const score = p.profileChecklist ? calculateChecklistResult(answers).score : null;
    return {
      id: p.id,
      name: p.name,
      segment: p.segment,
      updatedAt: p.updatedAt.toISOString(),
      hasChecklist: Boolean(p.profileChecklist),
      hasComparison: Boolean(p.businessProfile),
      score,
    };
  });

  return <ProspectListClient prospects={rows} />;
}
