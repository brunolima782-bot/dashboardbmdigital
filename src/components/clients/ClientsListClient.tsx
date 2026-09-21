"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Pencil, Trash2, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatCurrency } from "@/lib/formatters";
import { useToast } from "@/components/providers/ToastProvider";

export type ClientListItem = {
  id: string;
  companyName: string;
  contactName: string;
  segment: string | null;
  city: string | null;
  state: string | null;
  logoUrl: string | null;
  brandColor: string;
  status: "ACTIVE" | "INACTIVE";
  monthlyInvestment: number;
};

export default function ClientsListClient({ clients }: { clients: ClientListItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [deleteTarget, setDeleteTarget] = useState<ClientListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        !search ||
        c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        (c.segment || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.city || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Erro ao excluir cliente", "error");
        setDeleting(false);
        return;
      }
      showToast("Cliente excluído com sucesso!", "success");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      showToast("Erro de conexão ao excluir cliente", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clientes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <Link href="/clientes/novo" className="btn-primary">
          <Plus className="h-4 w-4" /> Novo cliente
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Buscar por empresa, segmento ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
        >
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="INACTIVE">Inativos</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={clients.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"}
          description={
            clients.length === 0
              ? "Cadastre seu primeiro cliente para começar a acompanhar investimentos em tráfego pago."
              : "Ajuste os filtros de busca para encontrar o que procura."
          }
          action={
            clients.length === 0 ? (
              <Link href="/clientes/novo" className="btn-primary">
                Cadastrar cliente
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="card card-hover p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: c.logoUrl ? undefined : c.brandColor }}
                >
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logoUrl} alt={c.companyName} className="h-full w-full object-cover" />
                  ) : (
                    c.companyName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.companyName}</p>
                  <p className="text-xs text-slate-400 truncate">{c.segment || "Sem segmento"}</p>
                </div>
                <Badge variant={c.status === "ACTIVE" ? "success" : "neutral"}>
                  {c.status === "ACTIVE" ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{[c.city, c.state].filter(Boolean).join(" - ") || "Localização não informada"}</span>
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
                <p className="text-xs text-slate-400">Investimento do mês</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(c.monthlyInvestment)}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link href={`/clientes/${c.id}`} className="btn-primary flex-1 text-xs px-3 py-2">
                  <Eye className="h-3.5 w-3.5" /> Ver Dashboard
                </Link>
                <Link
                  href={`/clientes/${c.id}/editar`}
                  className="btn-secondary text-xs px-3 py-2"
                  aria-label="Editar cliente"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  className="btn-secondary text-xs px-3 py-2 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40"
                  onClick={() => setDeleteTarget(c)}
                  aria-label="Excluir cliente"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Excluir ${deleteTarget?.companyName}?`}
        description="Essa ação é permanente e removerá todos os investimentos e orçamentos associados a este cliente."
        confirmLabel="Excluir cliente"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
