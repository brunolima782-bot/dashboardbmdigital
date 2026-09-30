import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1, "Informe o nome da empresa"),
  segment: z.string().optional(),
});

export async function GET() {
  const prospects = await prisma.prospect.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      businessProfile: { select: { id: true } },
      profileChecklist: { select: { id: true, answers: true } },
    },
  });
  return NextResponse.json(prospects);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const prospect = await prisma.prospect.create({ data: parsed.data });
    return NextResponse.json(prospect, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar prospect:", error);
    return NextResponse.json({ error: "Erro ao criar prospect" }, { status: 500 });
  }
}
