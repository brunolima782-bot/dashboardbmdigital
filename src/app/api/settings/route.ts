import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  agencyName: z.string().min(2, "Informe o nome da agência"),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
});

export async function GET() {
  let settings = await prisma.agencySettings.findFirst();
  if (!settings) {
    settings = await prisma.agencySettings.create({ data: { agencyName: "Minha Agência" } });
  }
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    let settings = await prisma.agencySettings.findFirst();
    if (!settings) {
      settings = await prisma.agencySettings.create({ data: { agencyName: "Minha Agência" } });
    }

    const updated = await prisma.agencySettings.update({
      where: { id: settings.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
