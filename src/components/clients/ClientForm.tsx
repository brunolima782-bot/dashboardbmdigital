"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import LogoUpload from "@/components/ui/LogoUpload";
import { maskPhone } from "@/lib/formatters";
import { useToast } from "@/components/providers/ToastProvider";

export type ClientFormData = {
  id?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  state: string;
  segment: string;
  logoUrl: string;
  brandColor: string;
  notes: string;
  status: "ACTIVE" | "INACTIVE";
};

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const DEFAULT_DATA: ClientFormData = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  whatsapp: "",
  city: "",
  state: "",
  segment: "",
  logoUrl: "",
  brandColor: "#4f46e5",
  notes: "",
  status: "ACTIVE",
};

export default function ClientForm({ initialData }: { initialData?: Partial<ClientFormData> }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<ClientFormData>({ ...DEFAULT_DATA, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(data.id);

  function update<K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!data.companyName.trim()) errs.companyName = "Informe o nome da empresa";
    if (!data.contactName.trim()) errs.contactName = "Informe o nome do responsável";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "E-mail inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const url = isEdit ? `/api/clients/${data.id}` : "/api/clients";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || "Erro ao salvar cliente", "error");
        setSaving(false);
        return;
      }
      showToast(isEdit ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!", "success");
      router.push(isEdit ? `/clientes/${data.id}` : "/clientes");
      router.refresh();
    } catch {
      showToast("Erro de conexão. Tente novamente.", "error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Identidade visual</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <LogoUpload
            value={data.logoUrl}
            onChange={(url) => update("logoUrl", url)}
            fallbackColor={data.brandColor}
            fallbackText={data.companyName}
          />
          <div>
            <label className="label">Cor principal da marca</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.brandColor}
                onChange={(e) => update("brandColor", e.target.value)}
                className="h-10 w-14 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={data.brandColor}
                onChange={(e) => update("brandColor", e.target.value)}
                className="input w-32"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Dados da empresa</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="label">Nome da empresa *</label>
            <input
              className="input"
              value={data.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="Ex: Mega Sol Piscinas"
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
          </div>

          <div>
            <label className="label">Nome do responsável *</label>
            <input
              className="input"
              value={data.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              placeholder="Ex: Carlos Andrade"
            />
            {errors.contactName && <p className="mt-1 text-xs text-red-600">{errors.contactName}</p>}
          </div>

          <div>
            <label className="label">Segmento</label>
            <input
              className="input"
              value={data.segment}
              onChange={(e) => update("segment", e.target.value)}
              placeholder="Ex: Piscinas de fibra"
            />
          </div>

          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="contato@empresa.com.br"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Telefone</label>
            <input
              className="input"
              value={data.phone}
              onChange={(e) => update("phone", maskPhone(e.target.value))}
              placeholder="(00) 0000-0000"
            />
          </div>

          <div>
            <label className="label">WhatsApp</label>
            <input
              className="input"
              value={data.whatsapp}
              onChange={(e) => update("whatsapp", maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={data.status}
              onChange={(e) => update("status", e.target.value as "ACTIVE" | "INACTIVE")}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>

          <div>
            <label className="label">Cidade</label>
            <input
              className="input"
              value={data.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Ex: Paulista"
            />
          </div>

          <div>
            <label className="label">Estado</label>
            <select className="input" value={data.state} onChange={(e) => update("state", e.target.value)}>
              <option value="">Selecione</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Observações</label>
            <textarea
              className="input min-h-[90px] resize-y"
              value={data.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Informações adicionais sobre o cliente..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar cliente"}
        </button>
      </div>
    </form>
  );
}
