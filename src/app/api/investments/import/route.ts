import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const rowSchema = z.object({
  clientId: z.string().min(1),
  platform: z.enum(["META", "GOOGLE", "LINKEDIN"]),
  campaignName: z.string().min(1),
  date: z.string().min(1),
  amount: z.number().nonnegative(),
  impressions: z.number().nonnegative().optional(),
  clicks: z.number().nonnegative().optional(),
  leads: z.number().nonnegative().optional(),
  conversions: z.number().nonnegative().optional(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1, "Nenhuma linha válida para importar"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const created = await prisma.$transaction(
      parsed.data.rows.map((row) =>
        prisma.investment.create({
          data: {
            clientId: row.clientId,
            platform: row.platform,
            campaignName: row.campaignName,
            date: new Date(row.date),
            amount: row.amount,
            impressions: row.impressions ?? 0,
            clicks: row.clicks ?? 0,
            leads: row.leads ?? 0,
            conversions: row.conversions ?? 0,
          },
        })
      )
    );

    return NextResponse.json({ imported: created.length }, { status: 201 });
  } catch (error) {
    console.error("Erro ao importar investimentos:", error);
    return NextResponse.json({ error: "Erro ao importar arquivo" }, { status: 500 });
  }
}
