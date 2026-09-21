"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Upload, Search, Pencil, Trash2, Wallet, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PLATFORM_LABELS } from "@/lib/metrics";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import InvestmentFormModal, { ClientOption, InvestmentRecord } from "./InvestmentFormModal";
import CsvImportModal from "./CsvImportModal";
import { useToast } from "@/components/providers/ToastProvider";

type InvestmentItem = InvestmentRecord & {
  id: string;
  client: { companyName: string; brandColor: string };
};

export default function InvestmentsPageClient({ clients }: { clients: ClientOption[] }) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState(searchParams.get("clientId") || "");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InvestmentItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InvestmentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const params = new URLSearchParams();
      if (filterClient) params.set("clientId", filterClient);
      if (filterPlatform) params.set("platform", filterPlatform);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("limit", "300");
      const res = await fetch(`/api/investments?${params.toString()}`);
      const data = await res.json();
      setInvestments(data);
    } catch {
      showToast("Erro ao carregar investimentos", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClient, filterPlatform, startDate, endDate]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  useEffect(() => {
    if (searchParams.get("clientId")) {
      setFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!search) return investments;
    return investments.filter((i) => i.campaignName.toLowerCase().includes(search.toLowerCase()));
  }, [investments, search]);

  const total = filtered.reduce((s, i) => s + i.amount, 0);
  const selectedTotal = filtered
    .filter((i) => selected.has(i.id))
    .reduce((s, i) => s + i.amount, 0);
  const allFilteredSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  function toggleSelectOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/investments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Erro ao excluir investimentos", "error");
        return;
      }
      showToast("Investimentos excluídos!", "success");
      setBulkDeleteOpen(false);
      setSelected(new Set());
      fetchInvestments();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/investments/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Erro ao excluir investimento", "error");
        return;
      }
      showToast("Investimento excluído!", "success");
      setDeleteTarget(null);
      fetchInvestments();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Investimentos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registre e acompanhe os investimentos em Meta Ads, Google Ads e LinkedIn Ads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Importar CSV
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Adicionar investimento
          </button>
        </div>
      </div>

      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select className="input" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
          <option value="">Todos os clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>
        <select className="input" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
          <option value="">Todas as plataformas</option>
          <option value="META">Meta Ads</option>
          <option value="GOOGLE">Google Ads</option>
          <option value="LINKEDIN">LinkedIn Ads</option>
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar campanha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {selected.size > 0 && (
        <div className="card flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-brand-200 dark:border-brand-500/30 bg-brand-50/60 dark:bg-brand-500/5">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            <span className="font-semibold">{selected.size}</span> investimento
            {selected.size !== 1 ? "s" : ""} selecionado{selected.size !== 1 ? "s" : ""} ·{" "}
            <span className="font-semibold">{formatCurrency(selectedTotal)}</span>
          </p>
          <div className="flex items-center gap-2 sm:ml-auto">
            <button className="btn-secondary" onClick={() => setSelected(new Set())}>
              <X className="h-4 w-4" /> Limpar seleção
            </button>
            <button className="btn-danger" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Excluir selecionados
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Carregando investimentos...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Nenhum investimento encontrado"
            description="Ajuste os filtros ou registre um novo investimento para começar."
            action={
              <button className="btn-primary" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" /> Adicionar investimento
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-400">
                  <th className="w-10 px-5 py-3 font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                  <th className="px-3 py-3 font-medium">Plataforma</th>
                  <th className="px-3 py-3 font-medium">Campanha</th>
                  <th className="px-3 py-3 font-medium text-right">Valor</th>
                  <th className="px-3 py-3 font-medium text-right">Leads</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className={
                      selected.has(inv.id)
                        ? "bg-brand-50/60 dark:bg-brand-500/10 text-slate-700 dark:text-slate-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }
                  >
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
                        checked={selected.has(inv.id)}
                        onChange={() => toggleSelectOne(inv.id)}
                        aria-label={`Selecionar investimento de ${inv.campaignName}`}
                      />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(inv.date)}</td>
                    <td className="px-3 py-3">{inv.client.companyName}</td>
                    <td className="px-3 py-3">{PLATFORM_LABELS[inv.platform]}</td>
                    <td className="px-3 py-3 max-w-[200px] truncate" title={inv.campaignName}>
                      {inv.campaignName}
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-slate-900 dark:text-white">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-3 py-3 text-right">{inv.leads || 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-slate-400 hover:text-brand-600"
                          onClick={() => {
                            setEditing(inv);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="text-slate-400 hover:text-red-600"
                          onClick={() => setDeleteTarget(inv)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-900 dark:text-white">
                  <td className="px-5 py-3" colSpan={5}>
                    Total ({filtered.length} registro{filtered.length !== 1 ? "s" : ""})
                  </td>
                  <td className="px-3 py-3 text-right">{formatCurrency(total)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <InvestmentFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setFormOpen(false);
          setEditing(null);
          fetchInvestments();
        }}
        clients={clients}
        initialData={editing}
        defaultClientId={filterClient}
      />

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          setImportOpen(false);
          fetchInvestments();
        }}
        clients={clients}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir investimento?"
        description={`O investimento de ${deleteTarget ? formatCurrency(deleteTarget.amount) : ""} será removido permanentemente.`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Excluir ${selected.size} investimento${selected.size !== 1 ? "s" : ""}?`}
        description={`Os ${selected.size} investimentos selecionados, totalizando ${formatCurrency(selectedTotal)}, serão removidos permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir todos"
        loading={bulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
