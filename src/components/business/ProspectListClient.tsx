"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Loader2, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { scoreStatus } from "@/lib/profileChecklist";

type ProspectRow = {
  id: string;
  name: string;
  segment: string | null;
  updatedAt: string;
  hasChecklist: boolean;
  hasComparison: boolean;
  score: number | null;
};

const STATUS_BADGE: Record<string, "danger" | "warning" | "brand" | "success"> = {
  "Crítico": "danger",
  "Regular": "warning",
  "Bom": "brand",
  "Excelente": "success",
};

export default function ProspectListClient({ prospects }: { prospects: ProspectRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      showToast("Informe o nome da empresa a analisar", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), segment: segment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao criar análise", "error");
        return;
      }
      router.push(`/analise-negocio/${data.id}`);
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/prospects/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Erro ao excluir análise", "error");
        return;
      }
      showToast("Análise excluída", "success");
      setDeleteId(null);
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Análise de Negócio</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analise empresas que você está prospectando — avalie o perfil no Google, compare com os
          concorrentes diretos e descubra a melhor estratégia de tráfego antes mesmo de fechar o cliente.
        </p>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Nova análise</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            placeholder="Nome da empresa (ex: Clínica Sorriso)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input sm:w-56"
            placeholder="Segmento (opcional)"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
          />
          <button className="btn-primary sm:w-auto" onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Analisar
          </button>
        </div>
      </div>

      {prospects.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma prospecção analisada ainda"
          description="Cadastre acima a primeira empresa que você quer analisar antes de fechar como cliente."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prospects.map((p) => (
            <div key={p.id} className="card card-hover p-5 flex flex-col gap-3">
              <Link href={`/analise-negocio/${p.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                <p className="text-xs text-slate-400">{p.segment || "Segmento não informado"}</p>
              </Link>
              <div className="flex items-center gap-2 flex-wrap">
                {p.score !== null && (
                  <Badge variant={STATUS_BADGE[scoreStatus(p.score)]}>{p.score}/100</Badge>
                )}
                {p.hasComparison && <Badge variant="neutral">Concorrentes ok</Badge>}
                {!p.hasChecklist && !p.hasComparison && (
                  <span className="text-xs text-slate-400">Ainda sem avaliação</span>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <button
                  onClick={() => setDeleteId(p.id)}
                  className="text-slate-400 hover:text-red-600"
                  aria-label="Excluir análise"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link
                  href={`/analise-negocio/${p.id}`}
                  className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Abrir <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Excluir esta análise?"
        description="O checklist e a comparação com concorrentes dessa prospecção serão removidos permanentemente."
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
