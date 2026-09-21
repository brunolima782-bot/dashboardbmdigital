import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientId: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  amount: z.number().nonnegative(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!clientId || !month || !year) {
    return NextResponse.json({ error: "Parâmetros obrigatórios: clientId, month, year" }, { status: 400 });
  }

  const budget = await prisma.budget.findUnique({
    where: {
      clientId_month_year: {
        clientId,
        month: parseInt(month),
        year: parseInt(year),
      },
    },
  });

  return NextResponse.json(budget);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        clientId_month_year: {
          clientId: parsed.data.clientId,
          month: parsed.data.month,
          year: parsed.data.year,
        },
      },
      update: { amount: parsed.data.amount },
      create: parsed.data,
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    return NextResponse.json({ error: "Erro ao salvar orçamento" }, { status: 500 });
  }
}
