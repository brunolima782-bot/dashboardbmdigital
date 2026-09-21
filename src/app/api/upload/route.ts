import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Envie PNG, JPG, WEBP ou SVG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo de 3MB." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("Erro ao enviar arquivo:", error);
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }
}
