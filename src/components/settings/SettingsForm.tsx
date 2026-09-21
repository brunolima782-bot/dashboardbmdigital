"use client";

import { useState, FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import LogoUpload from "@/components/ui/LogoUpload";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";

export default function SettingsForm({
  initialAgencyName,
  initialLogoUrl,
  initialPrimaryColor,
}: {
  initialAgencyName: string;
  initialLogoUrl: string;
  initialPrimaryColor: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [agencyName, setAgencyName] = useState(initialAgencyName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!agencyName.trim()) {
      showToast("Informe o nome da agência", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName, logoUrl, primaryColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao salvar configurações", "error");
        return;
      }
      showToast("Configurações salvas com sucesso!", "success");
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-xl">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Identidade da agência</h3>
        <LogoUpload value={logoUrl} onChange={setLogoUrl} fallbackColor={primaryColor} fallbackText={agencyName} />
      </div>

      <div>
        <label className="label">Nome da agência *</label>
        <input className="input" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
      </div>

      <div>
        <label className="label">Cor principal</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-14 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
          />
          <input className="input w-32" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
