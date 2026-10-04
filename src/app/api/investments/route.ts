import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const investmentSchema = z.object({
  clientId: z.string().min(1, "Selecione o cliente"),
  platform: z.enum(["META", "GOOGLE", "LINKEDIN"]),
  campaignName: z.string().min(1, "Informe a campanha"),
  date: z.string().min(1, "Informe a data"),
  amount: z.number().positive("Informe um valor válido"),
  impressions: z.number().nonnegative().optional(),
  reach: z.number().nonnegative().optional(),
  clicks: z.number().nonnegative().optional(),
  leads: z.number().nonnegative().optional(),
  conversions: z.number().nonnegative().optional(),
  localActions: z.number().nonnegative().optional(),
  calls: z.number().nonnegative().optional(),
  conversionValue: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const platform = searchParams.get("platform");
  const campaign = searchParams.get("campaign");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = searchParams.get("limit");

  const investments = await prisma.investment.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(platform ? { platform: platform as "META" | "GOOGLE" | "LINKEDIN" } : {}),
      ...(campaign ? { campaignName: { contains: campaign } } : {}),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    },
    include: { client: { select: { companyName: true, brandColor: true } } },
    orderBy: { date: "desc" },
    take: limit ? parseInt(limit) : undefined,
  });

  return NextResponse.json(investments);
}

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Selecione ao menos um investimento"),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bulkDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const result = await prisma.investment.deleteMany({
      where: { id: { in: parsed.data.ids } },
    });

    return NextResponse.json({ ok: true, count: result.count });
  } catch (error) {
    console.error("Erro ao excluir investimentos:", error);
    return NextResponse.json({ error: "Erro ao excluir investimentos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = investmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { date, ...rest } = parsed.data;
    const investment = await prisma.investment.create({
      data: {
        ...rest,
        date: new Date(date),
      },
    });

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar investimento:", error);
    return NextResponse.json({ error: "Erro ao registrar investimento" }, { status: 500 });
  }
}
