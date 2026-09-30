import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnaliseNegocioTabs from "@/components/business/AnaliseNegocioTabs";
import type { ChecklistAnswer } from "@/lib/profileChecklist";

export const dynamic = "force-dynamic";

export default async function BusinessAnalysisPage({ params }: { params: { clientId: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.clientId } });
  if (!client) notFound();

  const settings = await prisma.agencySettings.findFirst();
  const agencyName = settings?.agencyName || "Minha Agência";

  const [profile, checklist] = await Promise.all([
    prisma.businessProfile.findUnique({
      where: { clientId: params.clientId },
      include: { competitors: true },
    }),
    prisma.profileChecklist.findUnique({ where: { clientId: params.clientId } }),
  ]);

  const businessAnalysisData = profile
    ? {
        profile: {
          businessName: profile.businessName,
          category: profile.category,
          isB2B: profile.isB2B,
          rating: profile.rating,
          reviewCount: profile.reviewCount,
          photoCount: profile.photoCount,
          hasWebsite: profile.hasWebsite,
          hasWhatsapp: profile.hasWhatsapp,
          completeHours: profile.completeHours,
          hasDescription: profile.hasDescription,
          respondsToReviews: profile.respondsToReviews,
          recentPosts: profile.recentPosts,
        },
        competitors: profile.competitors.map((c) => ({
          name: c.name,
          rating: c.rating,
          reviewCount: c.reviewCount,
          photoCount: c.photoCount,
        })),
      }
    : null;

  const checklistData = {
    companyName: checklist?.companyName || "",
    cityNeighborhood: checklist?.cityNeighborhood || "",
    evaluatedBy: checklist?.evaluatedBy || "",
    answers: (checklist?.answers as Record<string, ChecklistAnswer>) || {},
  };

  return (
    <AnaliseNegocioTabs
      clientId={client.id}
      clientName={client.companyName}
      agencyName={agencyName}
      checklistData={checklistData}
      businessAnalysisData={businessAnalysisData}
    />
  );
}
