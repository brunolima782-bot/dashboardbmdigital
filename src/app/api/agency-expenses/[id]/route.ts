import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.agencyExpense.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return NextResponse.json({ error: "Erro ao excluir despesa" }, { status: 500 });
  }
}
