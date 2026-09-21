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

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }
  return NextResponse.json(client);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = clientSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.client.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 });
  }
}
