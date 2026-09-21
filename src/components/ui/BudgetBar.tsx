"use client";

import { useState } from "react";
import { Pencil, Loader2, Check, X } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function BudgetBar({
  clientId,
  month,
  year,
  budgetAmount,
  invested,
}: {
  clientId: string;
  month: number;
  year: number;
  budgetAmount: number;
  invested: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(budgetAmount || ""));
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const usage = budgetAmount > 0 ? (invested / budgetAmount) * 100 : 0;
  const balance = budgetAmount - invested;
  const over = usage > 100;

  async function handleSave() {
    const amount = parseFloat(value.replace(",", "."));
    if (isNaN(amount) || amount < 0) {
      showToast("Informe um valor de orçamento válido", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, month, year, amount }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Erro ao salvar orçamento", "error");
        return;
      }
      showToast("Orçamento atualizado!", "success");
      setEditing(false);
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Orçamento mensal</h3>
          <p className="text-xs text-slate-400">Controle de utilização do orçamento no mês</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <Pencil className="h-3 w-3" /> Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            step="0.01"
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00"
            autoFocus
          />
          <button onClick={handleSave} disabled={saving} className="btn-primary px-3 py-2.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setValue(String(budgetAmount || ""));
            }}
            className="btn-secondary px-3 py-2.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : budgetAmount === 0 ? (
        <p className="text-sm text-slate-400 mb-3">Nenhum orçamento definido para este mês.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-xs text-slate-400">Orçamento</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(budgetAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Investido</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(invested)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Saldo</p>
            <p className={clsx("text-sm font-semibold", balance < 0 ? "text-red-600" : "text-emerald-600")}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      )}

      {budgetAmount > 0 && !editing && (
        <>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={clsx("h-full rounded-full transition-all", over ? "bg-red-500" : "bg-brand-600")}
              style={{ width: `${Math.min(usage, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {formatPercent(usage, 0)} do orçamento utilizado
            {over && <span className="text-red-600 font-medium"> · orçamento excedido</span>}
          </p>
        </>
      )}
    </div>
  );
}
