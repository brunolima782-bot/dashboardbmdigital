import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const investmentSchema = z.object({
  clientId: z.string().min(1),
  platform: z.enum(["META", "GOOGLE", "LINKEDIN"]),
  campaignName: z.string().min(1),
  date: z.string().min(1),
  amount: z.number().positive(),
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = investmentSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { date, ...rest } = parsed.data;
    const investment = await prisma.investment.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    return NextResponse.json(investment);
  } catch (error) {
    console.error("Erro ao atualizar investimento:", error);
    return NextResponse.json({ error: "Erro ao atualizar investimento" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.investment.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir investimento:", error);
    return NextResponse.json({ error: "Erro ao excluir investimento" }, { status: 500 });
  }
}
