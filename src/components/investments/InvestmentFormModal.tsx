"use client";

import { useState, useEffect, FormEvent } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export type ClientOption = { id: string; companyName: string };

function parseBRNumber(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatBRNumber(value: number | undefined): string {
  if (!value) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRInt(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(/[^\d-]/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

function formatBRInt(value: number | undefined): string {
  if (!value) return "";
  return value.toLocaleString("pt-BR");
}

export type InvestmentRecord = {
  id?: string;
  clientId: string;
  platform: "META" | "GOOGLE" | "LINKEDIN";
  campaignName: string;
  date: string;
  amount: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  leads?: number;
  conversions?: number;
  conversionValue?: number;
  localActions?: number;
  calls?: number;
  notes?: string;
};

const EMPTY: InvestmentRecord = {
  clientId: "",
  platform: "META",
  campaignName: "",
  date: new Date().toISOString().slice(0, 10),
  amount: 0,
  impressions: undefined,
  reach: undefined,
  clicks: undefined,
  leads: undefined,
  conversions: undefined,
  conversionValue: undefined,
  localActions: undefined,
  calls: undefined,
  notes: "",
};

export default function InvestmentFormModal({
  open,
  onClose,
  onSaved,
  clients,
  initialData,
  defaultClientId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  clients: ClientOption[];
  initialData?: InvestmentRecord | null;
  defaultClientId?: string;
}) {
  const { showToast } = useToast();
  const [data, setData] = useState<InvestmentRecord>(EMPTY);
  const [amountText, setAmountText] = useState("");
  const [conversionValueText, setConversionValueText] = useState("");
  const [impressionsText, setImpressionsText] = useState("");
  const [reachText, setReachText] = useState("");
  const [clicksText, setClicksText] = useState("");
  const [leadsText, setLeadsText] = useState("");
  const [conversionsText, setConversionsText] = useState("");
  const [localActionsText, setLocalActionsText] = useState("");
  const [callsText, setCallsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (open) {
      const next = initialData || {
        ...EMPTY,
        clientId: defaultClientId || "",
      };
      setData(next);
      setAmountText(formatBRNumber(next.amount));
      setConversionValueText(formatBRNumber(next.conversionValue));
      setImpressionsText(formatBRInt(next.impressions));
      setReachText(formatBRInt(next.reach));
      setClicksText(formatBRInt(next.clicks));
      setLeadsText(formatBRInt(next.leads));
      setConversionsText(formatBRInt(next.conversions));
      setLocalActionsText(formatBRInt(next.localActions));
      setCallsText(formatBRInt(next.calls));
      setShowMetrics(Boolean(initialData));
    }
  }, [open, initialData, defaultClientId]);

  function update<K extends keyof InvestmentRecord>(key: K, value: InvestmentRecord[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data.clientId) {
      showToast("Selecione o cliente", "error");
      return;
    }
    if (!data.campaignName.trim()) {
      showToast("Informe o nome da campanha", "error");
      return;
    }
    if (!data.amount || data.amount <= 0) {
      showToast("Informe um valor investido válido", "error");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/investments/${initialData!.id}` : "/api/investments";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || "Erro ao salvar investimento", "error");
        setSaving(false);
        return;
      }
      showToast(isEdit ? "Investimento atualizado!" : "Investimento registrado com sucesso!", "success");
      onSaved();
    } catch {
      showToast("Erro de conexão. Tente novamente.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-xl animate-fade-in">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {isEdit ? "Editar investimento" : "Adicionar investimento"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Cliente *</label>
            <select className="input" value={data.clientId} onChange={(e) => update("clientId", e.target.value)}>
              <option value="">Selecione o cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Plataforma *</label>
              <select
                className="input"
                value={data.platform}
                onChange={(e) => update("platform", e.target.value as InvestmentRecord["platform"])}
              >
                <option value="META">Meta Ads</option>
                <option value="GOOGLE">Google Ads</option>
                <option value="LINKEDIN">LinkedIn Ads</option>
              </select>
            </div>
            <div>
              <label className="label">Data *</label>
              <input
                type="date"
                className="input"
                value={data.date.slice(0, 10)}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Campanha *</label>
            <input
              className="input"
              value={data.campaignName}
              onChange={(e) => update("campaignName", e.target.value)}
              placeholder="Ex: Piscina Ágata"
            />
          </div>

          <div>
            <label className="label">Valor investido (R$) *</label>
            <input
              type="text"
              inputMode="decimal"
              className="input"
              value={amountText}
              onChange={(e) => {
                setAmountText(e.target.value);
                update("amount", parseBRNumber(e.target.value));
              }}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="label">Observação</label>
            <textarea
              className="input min-h-[70px] resize-y"
              value={data.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Ex: Campanha de geração de leads"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMetrics((v) => !v)}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {showMetrics ? "Ocultar métricas detalhadas" : "+ Adicionar métricas detalhadas (opcional)"}
          </button>

          {showMetrics && (
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <div>
                <label className="label">Impressões</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={impressionsText}
                  onChange={(e) => {
                    setImpressionsText(e.target.value);
                    update("impressions", e.target.value ? parseBRInt(e.target.value) : undefined);
                  }}
                />
              </div>
              <div>
                <label className="label">Alcance</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={reachText}
                  onChange={(e) => {
                    setReachText(e.target.value);
                    update("reach", e.target.value ? parseBRInt(e.target.value) : undefined);
                  }}
                />
              </div>
              <div>
                <label className="label">Cliques</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={clicksText}
                  onChange={(e) => {
                    setClicksText(e.target.value);
                    update("clicks", e.target.value ? parseBRInt(e.target.value) : undefined);
                  }}
                />
              </div>
              <div>
                <label className="label">Leads</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={leadsText}
                  onChange={(e) => {
                    setLeadsText(e.target.value);
                    update("leads", e.target.value ? parseBRInt(e.target.value) : undefined);
                  }}
                />
              </div>
              <div>
                <label className="label">Conversões</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={conversionsText}
                  onChange={(e) => {
                    setConversionsText(e.target.value);
                    update("conversions", e.target.value ? parseBRInt(e.target.value) : undefined);
                  }}
                />
              </div>
              <div>
                <label className="label">Valor de conversão (R$)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input"
                  value={conversionValueText}
                  onChange={(e) => {
                    setConversionValueText(e.target.value);
                    update("conversionValue", e.target.value ? parseBRNumber(e.target.value) : undefined);
                  }}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="label">Ações locais (Google)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={localActionsText}
                  onChange={(e) => {
                    setLocalActionsText(e.target.value);
                    update("localActions", e.target.value ? parseBRInt(e.target.value) : undefined);
                  }}
                />
              </div>
              <div>
                <label className="label">Chamadas (Google)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={callsText}
                  onChange={(e) => {
                    setCallsText(e.target.value);
                    update("calls", e.target.value ? parseBRInt(e.target.value) : undefined);
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
