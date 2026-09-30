import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CHECKLIST_ITEMS } from "@/lib/profileChecklist";

const validIds = new Set(CHECKLIST_ITEMS.map((i) => i.id));

const schema = z.object({
  companyName: z.string().optional(),
  cityNeighborhood: z.string().optional(),
  evaluatedBy: z.string().optional(),
  answers: z.record(z.enum(["TEM", "NAO_TEM", "NAO_SE_APLICA"])),
});

export async function GET(_request: NextRequest, { params }: { params: { clientId: string } }) {
  const checklist = await prisma.profileChecklist.findUnique({ where: { clientId: params.clientId } });
  return NextResponse.json(checklist);
}

export async function PUT(request: NextRequest, { params }: { params: { clientId: string } }) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: params.clientId } });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const answers = Object.fromEntries(
      Object.entries(parsed.data.answers).filter(([id]) => validIds.has(id))
    );

    const checklist = await prisma.profileChecklist.upsert({
      where: { clientId: params.clientId },
      create: {
        clientId: params.clientId,
        companyName: parsed.data.companyName,
        cityNeighborhood: parsed.data.cityNeighborhood,
        evaluatedBy: parsed.data.evaluatedBy,
        answers,
      },
      update: {
        companyName: parsed.data.companyName,
        cityNeighborhood: parsed.data.cityNeighborhood,
        evaluatedBy: parsed.data.evaluatedBy,
        answers,
      },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Erro ao salvar checklist de perfil:", error);
    return NextResponse.json({ error: "Erro ao salvar checklist de perfil" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { clientId: string } }) {
  try {
    await prisma.profileChecklist.deleteMany({ where: { clientId: params.clientId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao limpar checklist de perfil:", error);
    return NextResponse.json({ error: "Erro ao limpar checklist de perfil" }, { status: 500 });
  }
}
