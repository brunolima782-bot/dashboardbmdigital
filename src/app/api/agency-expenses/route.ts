import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  category: z.string().min(1, "Informe a categoria"),
  description: z.string().optional(),
  amount: z.number().positive("Informe um valor válido"),
  date: z.string().min(1, "Informe a data"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const expenses = await prisma.agencyExpense.findMany({
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
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { date, ...rest } = parsed.data;
    const expense = await prisma.agencyExpense.create({
      data: { ...rest, date: new Date(date) },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar despesa:", error);
    return NextResponse.json({ error: "Erro ao registrar despesa" }, { status: 500 });
  }
}
