import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const competitorSchema = z.object({
  name: z.string().min(1, "Informe o nome do concorrente"),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().nonnegative(),
  photoCount: z.number().nonnegative(),
});

const profileSchema = z.object({
  businessName: z.string().min(1, "Informe o nome do negócio"),
  category: z.string().min(1, "Informe a categoria do negócio"),
  isB2B: z.boolean(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().nonnegative(),
  photoCount: z.number().nonnegative(),
  hasWebsite: z.boolean(),
  hasWhatsapp: z.boolean(),
  completeHours: z.boolean(),
  hasDescription: z.boolean(),
  respondsToReviews: z.boolean(),
  recentPosts: z.boolean(),
  competitors: z.array(competitorSchema).max(10),
});

export async function GET(_request: NextRequest, { params }: { params: { clientId: string } }) {
  const profile = await prisma.businessProfile.findUnique({
    where: { clientId: params.clientId },
    include: { competitors: true },
  });
  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest, { params }: { params: { clientId: string } }) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: params.clientId } });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const { competitors, ...profileData } = parsed.data;

    const profile = await prisma.$transaction(async (tx) => {
      const saved = await tx.businessProfile.upsert({
        where: { clientId: params.clientId },
        create: { clientId: params.clientId, ...profileData },
        update: profileData,
      });

      await tx.competitor.deleteMany({ where: { businessProfileId: saved.id } });
      if (competitors.length > 0) {
        await tx.competitor.createMany({
          data: competitors.map((c) => ({ ...c, businessProfileId: saved.id })),
        });
      }

      return tx.businessProfile.findUnique({
        where: { id: saved.id },
        include: { competitors: true },
      });
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao salvar análise de negócio:", error);
    return NextResponse.json({ error: "Erro ao salvar análise de negócio" }, { status: 500 });
  }
}
