import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientId: z.string().optional().nullable(),
  description: z.string().optional(),
  amount: z.number().positive("Informe um valor válido"),
  date: z.string().min(1, "Informe a data"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const revenues = await prisma.agencyRevenue.findMany({
    where: {
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    },
    include: { client: { select: { companyName: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(revenues);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { date, clientId, ...rest } = parsed.data;
    const revenue = await prisma.agencyRevenue.create({
      data: {
        ...rest,
        clientId: clientId || null,
        date: new Date(date),
      },
    });

    return NextResponse.json(revenue, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar receita:", error);
    return NextResponse.json({ error: "Erro ao registrar receita" }, { status: 500 });
  }
}
