import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findFirst({
    where: { clientId: params.id, role: "CLIENT" },
    select: { id: true, email: true },
  });
  return NextResponse.json(user);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: params.id } });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({ where: { clientId: params.id, role: "CLIENT" } });

    const emailOwner = await prisma.user.findUnique({ where: { email } });
    if (emailOwner && emailOwner.id !== existing?.id) {
      return NextResponse.json({ error: "Este e-mail já está em uso por outro usuário" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const user = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { email, passwordHash } })
      : await prisma.user.create({
          data: {
            name: client.contactName || client.companyName,
            email,
            passwordHash,
            role: "CLIENT",
            clientId: params.id,
          },
        });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Erro ao criar acesso do cliente:", error);
    return NextResponse.json({ error: "Erro ao criar acesso do cliente" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.user.deleteMany({ where: { clientId: params.id, role: "CLIENT" } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao remover acesso do cliente:", error);
    return NextResponse.json({ error: "Erro ao remover acesso do cliente" }, { status: 500 });
  }
}
