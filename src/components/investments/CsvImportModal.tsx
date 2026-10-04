"use client";

import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { X, Upload, Loader2, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import type { ClientOption } from "./InvestmentFormModal";

type ParsedRow = {
  raw: Record<string, string>;
  valid: boolean;
  error?: string;
  platform?: "META" | "GOOGLE" | "LINKEDIN";
  date?: string;
  campaignName?: string;
  amount?: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
  conversions?: number;
};

function normalizePlatform(value: string): "META" | "GOOGLE" | "LINKEDIN" | null {
  const v = value.trim().toLowerCase();
  if (v.includes("meta") || v.includes("facebook")) return "META";
  if (v.includes("google")) return "GOOGLE";
  if (v.includes("linkedin")) return "LINKEDIN";
  return null;
}

function parseDate(value: string): string | null {
  const v = value.trim();
  // dd/mm/aaaa
  const br = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  // aaaa-mm-dd
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return v;
  return null;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  // Exportações do Meta Ads usam ponto decimal (ex: 394.03); o restante usa formato brasileiro (1.234,56).
  if (/^-?\d+\.\d{1,2}$/.test(trimmed)) {
    const n = parseFloat(trimmed);
    return isNaN(n) ? undefined : n;
  }
  const cleaned = trimmed.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

// Exportações reais do Google/Meta/LinkedIn Ads costumam vir com 1-2 linhas de
// título antes do cabeçalho de verdade. Acha a linha que parece o cabeçalho
// (contém "Campanha"/"Campaign" e tem várias colunas) e descarta o que vem antes.
function stripPreamble(text: string): string {
  const lines = text.split(/\r?\n/);
  const headerIdx = lines.findIndex((line) => {
    const lower = line.toLowerCase();
    return (lower.includes("campanha") || lower.includes("campaign")) && line.split(",").length > 2;
  });
  if (headerIdx <= 0) return text;
  return lines.slice(headerIdx).join("\n");
}

const PLATFORM_OPTIONS: { value: "META" | "GOOGLE" | "LINKEDIN"; label: string }[] = [
  { value: "GOOGLE", label: "Google Ads" },
  { value: "META", label: "Meta Ads" },
  { value: "LINKEDIN", label: "LinkedIn Ads" },
];

export default function CsvImportModal({
  open,
  onClose,
  onImported,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  clients: ClientOption[];
}) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [clientId, setClientId] = useState("");
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fallbackDate, setFallbackDate] = useState(new Date().toISOString().slice(0, 10));
  const [fallbackPlatform, setFallbackPlatform] = useState<"META" | "GOOGLE" | "LINKEDIN">("GOOGLE");

  function handleFile(file: File) {
    setFileName(file.name);
    file.text().then((text) => {
      const cleaned = stripPreamble(text);
      Papa.parse<Record<string, string>>(cleaned, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => setRawRows(results.data),
        error: () => showToast("Não foi possível ler o arquivo CSV", "error"),
      });
    });
  }

  const rows: ParsedRow[] = useMemo(() => {
    return rawRows
      .map((raw) => {
        const campaignRaw = (
          raw["Campanha"] || raw["campanha"] || raw["Nome da campanha"] || raw["Campaign"] || ""
        ).trim();
        // Linhas de "Total: Campanhas / Conta / ..." não têm nome de campanha real — ignora.
        if (!campaignRaw || campaignRaw === "--" || campaignRaw === "-") return null;

        const dateRaw =
          raw["Data"] || raw["data"] || raw["Date"] || raw["Início dos relatórios"] || fallbackDate;
        const platformRaw = raw["Plataforma"] || raw["plataforma"] || raw["Platform"] || "";
        const amountRaw =
          raw["Investimento"] ||
          raw["investimento"] ||
          raw["Amount"] ||
          raw["Custo"] ||
          raw["custo"] ||
          raw["Cost"] ||
          raw["Valor gasto (BRL)"] ||
          raw["Valor gasto"] ||
          "";

        // Campanhas pausadas/sem veiculação no período não entram como investimento.
        const spent = parseNumber(amountRaw);
        if (spent === 0) return null;

        const date = parseDate(dateRaw) || parseDate(fallbackDate);
        const platform = platformRaw ? normalizePlatform(platformRaw) : fallbackPlatform;
        const amount = spent;

        let error: string | undefined;
        if (!date) error = "Data inválida (use DD/MM/AAAA)";
        else if (!platform) error = "Plataforma inválida (Meta Ads, Google Ads ou LinkedIn Ads)";
        else if (amount === undefined || amount < 0) error = "Investimento/Custo inválido";

        const row: ParsedRow = {
          raw,
          valid: !error,
          error,
          date: date || undefined,
          platform: platform || undefined,
          campaignName: campaignRaw,
          amount,
          impressions: parseNumber(raw["Impressões"] || raw["Impressoes"]),
          clicks: parseNumber(raw["Cliques"]),
          leads: parseNumber(raw["Leads"] || raw["Novos contatos de mensagem"] || raw["Resultados"]),
          conversions: parseNumber(raw["Conversões"] || raw["Conversoes"]),
        };
        return row;
      })
      .filter((r): r is ParsedRow => r !== null);
  }, [rawRows, fallbackDate, fallbackPlatform]);

  async function handleImport() {
    if (!clientId) {
      showToast("Selecione o cliente para importar os dados", "error");
      return;
    }
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) {
      showToast("Nenhuma linha válida para importar", "error");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/investments/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: validRows.map((r) => ({
            clientId,
            platform: r.platform,
            campaignName: r.campaignName,
            date: r.date,
            amount: r.amount,
            impressions: r.impressions,
            clicks: r.clicks,
            leads: r.leads,
            conversions: r.conversions,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao importar arquivo", "error");
        return;
      }
      showToast(`${data.imported} investimento(s) importado(s) com sucesso!`, "success");
      setRawRows([]);
      setFileName("");
      onImported();
    } catch {
      showToast("Erro de conexão ao importar", "error");
    } finally {
      setImporting(false);
    }
  }

  function handleClose() {
    setRawRows([]);
    setFileName("");
    setClientId("");
    onClose();
  }

  if (!open) return null;

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={handleClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-xl animate-fade-in">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Importar investimentos via CSV</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="label">Cliente de destino *</label>
            <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
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
              <label className="label">Plataforma padrão</label>
              <select
                className="input"
                value={fallbackPlatform}
                onChange={(e) => setFallbackPlatform(e.target.value as "META" | "GOOGLE" | "LINKEDIN")}
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Data de referência</label>
              <input
                type="date"
                className="input"
                value={fallbackDate}
                onChange={(e) => setFallbackDate(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 -mt-3">
            Usadas apenas quando o arquivo não tem colunas próprias de Plataforma/Data (comum em exportações
            direto do Google Ads/Meta Ads, que trazem só o total do período por campanha).
          </p>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Aceita o export direto de <strong>Campanhas</strong> do Google Ads/Meta Ads/LinkedIn Ads (coluna{" "}
              <strong>Custo</strong> ou <strong>Investimento</strong> + <strong>Campanha</strong>), ou uma
              planilha própria com <strong>Data</strong> (DD/MM/AAAA), <strong>Plataforma</strong>,{" "}
              <strong>Campanha</strong>, <strong>Investimento</strong>.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-8 flex flex-col items-center gap-2 text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm font-medium">{fileName || "Clique para selecionar o arquivo CSV"}</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>

          {rows.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-3 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {validCount} válida(s)
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1.5 text-red-600">
                    <AlertCircle className="h-4 w-4" /> {invalidCount} com erro
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0">
                    <tr className="text-left text-slate-500">
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Data</th>
                      <th className="px-3 py-2 font-medium">Plataforma</th>
                      <th className="px-3 py-2 font-medium">Campanha</th>
                      <th className="px-3 py-2 font-medium text-right">Investimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.slice(0, 50).map((r, idx) => (
                      <tr key={idx} className={r.valid ? "" : "bg-red-50/50 dark:bg-red-950/20"}>
                        <td className="px-3 py-2">
                          {r.valid ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <span title={r.error} className="text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">{r.date || r.raw["Data"] || "-"}</td>
                        <td className="px-3 py-2">{r.platform || r.raw["Plataforma"] || "-"}</td>
                        <td className="px-3 py-2">{r.campaignName || "-"}</td>
                        <td className="px-3 py-2 text-right">{r.amount ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invalidCount > 0 && (
                <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Linhas com erro serão ignoradas na importação.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleImport}
              disabled={importing || validCount === 0}
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? "Importando..." : `Importar ${validCount} registro(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
