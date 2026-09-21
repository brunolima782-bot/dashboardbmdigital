import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const clientSchema = z.object({
  companyName: z.string().min(2, "Informe o nome da empresa"),
  contactName: z.string().min(2, "Informe o nome do responsável"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.string().optional(),
  logoUrl: z.string().optional(),
  brandColor: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");

  const clients = await prisma.client.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { companyName: { contains: search } },
              { segment: { contains: search } },
              { city: { contains: search } },
            ],
          }
        : {}),
      ...(status ? { status: status as "ACTIVE" | "INACTIVE" } : {}),
    },
    orderBy: { companyName: "asc" },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const results = await Promise.all(
    clients.map(async (client) => {
      const investments = await prisma.investment.findMany({
        where: { clientId: client.id, date: { gte: monthStart, lte: monthEnd } },
        select: { amount: true },
      });
      const monthlyInvestment = investments.reduce((sum, i) => sum + i.amount, 0);
      return { ...client, monthlyInvestment };
    })
  );

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = clientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
