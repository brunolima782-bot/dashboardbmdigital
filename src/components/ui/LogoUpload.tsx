"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, ImageOff } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function LogoUpload({
  value,
  onChange,
  fallbackColor = "#4f46e5",
  fallbackText = "?",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  fallbackColor?: string;
  fallbackText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao enviar imagem", "error");
        return;
      }
      onChange(data.url);
    } catch {
      showToast("Erro de conexão ao enviar imagem", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 text-lg font-semibold text-white"
        style={{ backgroundColor: value ? undefined : fallbackColor }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Logo" className="h-full w-full object-cover" />
        ) : fallbackText ? (
          fallbackText.slice(0, 2).toUpperCase()
        ) : (
          <ImageOff className="h-5 w-5 text-slate-400" />
        )}
      </div>
      <div>
        <button
          type="button"
          className="btn-secondary text-xs px-3 py-2"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Enviando..." : "Enviar logo"}
        </button>
        <p className="mt-1 text-xs text-slate-400">PNG, JPG ou SVG · até 3MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
