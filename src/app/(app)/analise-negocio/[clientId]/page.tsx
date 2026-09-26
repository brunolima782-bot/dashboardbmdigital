import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BusinessAnalysisClient from "@/components/business/BusinessAnalysisClient";

export const dynamic = "force-dynamic";

export default async function BusinessAnalysisPage({ params }: { params: { clientId: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.clientId } });
  if (!client) notFound();

  const settings = await prisma.agencySettings.findFirst();
  const agencyName = settings?.agencyName || "Minha Agência";

  const profile = await prisma.businessProfile.findUnique({
    where: { clientId: params.clientId },
    include: { competitors: true },
  });

  const initialData = profile
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

  return (
    <BusinessAnalysisClient
      clientId={client.id}
      clientName={client.companyName}
      agencyName={agencyName}
      initialData={initialData}
    />
  );
}
