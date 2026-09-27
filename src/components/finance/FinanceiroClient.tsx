"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  Receipt,
  TrendingUp,
  PiggyBank,
  Users,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDateLong } from "@/lib/formatters";
import { useToast } from "@/components/providers/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const EXPENSE_CATEGORIES = ["Ferramentas", "Aluguel", "Energia", "Marketing", "Impostos", "Outros"];

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function parseBRNumber(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

type Revenue = {
  id: string;
  clientId: string | null;
  description: string | null;
  amount: number;
  date: Date;
  client: { companyName: string } | null;
};

type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  date: Date;
};

export default function FinanceiroClient({
  month,
  year,
  revenues,
  expenses,
  activeClients,
  clients,
  reservePercent,
  clientGoalCount,
  clientGoalTicket,
}: {
  month: number;
  year: number;
  revenues: Revenue[];
  expenses: Expense[];
  activeClients: number;
  clients: { id: string; companyName: string }[];
  reservePercent: number;
  clientGoalCount: number;
  clientGoalTicket: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const reserveAmount = Math.max(netProfit, 0) * (reservePercent / 100);
  const proLaboreAmount = Math.max(netProfit, 0) - reserveAmount;

  const goalRevenue = clientGoalCount * clientGoalTicket;
  const clientProgress = Math.min((activeClients / clientGoalCount) * 100, 100);
  const revenueProgress = goalRevenue > 0 ? Math.min((totalRevenue / goalRevenue) * 100, 100) : 0;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  // --- Receita ---
  const [addingRevenue, setAddingRevenue] = useState(false);
  const [revClientId, setRevClientId] = useState("");
  const [revDescription, setRevDescription] = useState("");
  const [revAmount, setRevAmount] = useState("");
  const [revDate, setRevDate] = useState(new Date().toISOString().slice(0, 10));
  const [savingRevenue, setSavingRevenue] = useState(false);
  const [deleteRevenueId, setDeleteRevenueId] = useState<string | null>(null);
  const [deletingRevenue, setDeletingRevenue] = useState(false);

  // --- Despesa ---
  const [addingExpense, setAddingExpense] = useState(false);
  const [expCategory, setExpCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [savingExpense, setSavingExpense] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  // --- Meta / percentual (configurações) ---
  const [editingGoals, setEditingGoals] = useState(false);
  const [reserveText, setReserveText] = useState(String(reservePercent));
  const [goalCountText, setGoalCountText] = useState(String(clientGoalCount));
  const [goalTicketText, setGoalTicketText] = useState(reservePercentToBR(clientGoalTicket));
  const [savingGoals, setSavingGoals] = useState(false);

  function reservePercentToBR(v: number) {
    return v ? v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
  }

  async function handleAddRevenue() {
    const amount = parseBRNumber(revAmount);
    if (amount <= 0) {
      showToast("Informe um valor válido", "error");
      return;
    }
    setSavingRevenue(true);
    try {
      const res = await fetch("/api/agency-revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: revClientId || undefined,
          description: revDescription || undefined,
          amount,
          date: revDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao registrar receita", "error");
        return;
      }
      showToast("Receita registrada!", "success");
      setAddingRevenue(false);
      setRevClientId("");
      setRevDescription("");
      setRevAmount("");
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSavingRevenue(false);
    }
  }

  async function handleDeleteRevenue() {
    if (!deleteRevenueId) return;
    setDeletingRevenue(true);
    try {
      const res = await fetch(`/api/agency-revenue/${deleteRevenueId}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Erro ao excluir receita", "error");
        return;
      }
      showToast("Receita excluída", "success");
      setDeleteRevenueId(null);
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setDeletingRevenue(false);
    }
  }

  async function handleAddExpense() {
    const amount = parseBRNumber(expAmount);
    if (amount <= 0) {
      showToast("Informe um valor válido", "error");
      return;
    }
    setSavingExpense(true);
    try {
      const res = await fetch("/api/agency-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: expCategory,
          description: expDescription || undefined,
          amount,
          date: expDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao registrar despesa", "error");
        return;
      }
      showToast("Despesa registrada!", "success");
      setAddingExpense(false);
      setExpDescription("");
      setExpAmount("");
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSavingExpense(false);
    }
  }

  async function handleDeleteExpense() {
    if (!deleteExpenseId) return;
    setDeletingExpense(true);
    try {
      const res = await fetch(`/api/agency-expenses/${deleteExpenseId}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Erro ao excluir despesa", "error");
        return;
      }
      showToast("Despesa excluída", "success");
      setDeleteExpenseId(null);
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setDeletingExpense(false);
    }
  }

  async function handleSaveGoals() {
    const reserve = parseBRNumber(reserveText);
    const goalCount = parseInt(goalCountText) || 1;
    const goalTicket = parseBRNumber(goalTicketText);
    if (reserve < 0 || reserve > 100) {
      showToast("O percentual de reserva precisa estar entre 0 e 100", "error");
      return;
    }
    setSavingGoals(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: undefined,
          reservePercent: reserve,
          clientGoalCount: goalCount,
          clientGoalTicket: goalTicket,
        }),
      });
      if (!res.ok) {
        showToast("Erro ao salvar metas", "error");
        return;
      }
      showToast("Metas atualizadas!", "success");
      setEditingGoals(false);
      router.refresh();
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSavingGoals(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financeiro da Agência</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Receitas dos clientes, despesas e sugestão de pró-labore — separado do investimento em mídia dos
            clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/financeiro?month=${prevMonth}&year=${prevYear}`}
            className="btn-secondary px-3 py-2"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[130px] text-center">
            {MONTH_LABELS[month - 1]} {year}
          </span>
          <Link
            href={`/financeiro?month=${nextMonth}&year=${nextYear}`}
            className="btn-secondary px-3 py-2"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs text-slate-400">Receita do mês</p>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs text-slate-400">Despesas do mês</p>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs text-slate-400">Lucro líquido</p>
          </div>
          <p className={`text-xl font-bold ${netProfit >= 0 ? "text-slate-900 dark:text-white" : "text-red-600"}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Meta de clientes</h3>
            <button
              className="ml-auto text-xs font-medium text-brand-600 hover:text-brand-700"
              onClick={() => setEditingGoals((v) => !v)}
            >
              {editingGoals ? "Cancelar" : "Editar meta"}
            </button>
          </div>

          {editingGoals ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nº de clientes (meta)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input"
                    value={goalCountText}
                    onChange={(e) => setGoalCountText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Ticket médio (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input"
                    value={goalTicketText}
                    onChange={(e) => setGoalTicketText(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">% a reter na empresa (o resto vira pró-labore sugerido)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input"
                  value={reserveText}
                  onChange={(e) => setReserveText(e.target.value)}
                />
              </div>
              <button className="btn-primary w-full" onClick={handleSaveGoals} disabled={savingGoals}>
                {savingGoals ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar metas
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between text-sm mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">Clientes ativos</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeClients} de {clientGoalCount}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${clientProgress}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-sm mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">Receita do mês</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(totalRevenue)} de {formatCurrency(goalRevenue)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${revenueProgress}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4.5 w-4.5 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pró-labore sugerido</h3>
          </div>
          {netProfit <= 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sem lucro no período (despesas iguais ou maiores que a receita) — ainda não há valor a retirar.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                <p className="text-xs text-slate-400">Reserva na empresa ({reservePercent}%)</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(reserveAmount)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/5 p-4">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Pró-labore saudável ({100 - reservePercent}%)
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(proLaboreAmount)}
                </p>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 leading-relaxed">
            Estimativa simples sobre o lucro do mês (receita − despesas). Não considera impostos nem é
            orientação contábil — ajuste o percentual de reserva para incluir sua margem de segurança e
            consulte um contador para os valores exatos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Receitas recebidas</h3>
            <button
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
              onClick={() => setAddingRevenue((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          </div>

          {addingRevenue && (
            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-4">
              <select className="input" value={revClientId} onChange={(e) => setRevClientId(e.target.value)}>
                <option value="">Sem cliente vinculado</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Descrição (ex: Mensalidade setembro)"
                value={revDescription}
                onChange={(e) => setRevDescription(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  className="input"
                  placeholder="Valor (R$)"
                  value={revAmount}
                  onChange={(e) => setRevAmount(e.target.value)}
                />
                <input type="date" className="input" value={revDate} onChange={(e) => setRevDate(e.target.value)} />
              </div>
              <button className="btn-primary w-full" onClick={handleAddRevenue} disabled={savingRevenue}>
                {savingRevenue ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar receita
              </button>
            </div>
          )}

          {revenues.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Nenhuma receita registrada neste mês.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {revenues.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {r.client?.companyName || r.description || "Receita"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateLong(new Date(r.date))}
                      {r.client && r.description ? ` · ${r.description}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-600">{formatCurrency(r.amount)}</span>
                    <button
                      className="text-slate-400 hover:text-red-600"
                      onClick={() => setDeleteRevenueId(r.id)}
                      aria-label="Excluir receita"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Despesas da agência</h3>
            <button
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
              onClick={() => setAddingExpense((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          </div>

          {addingExpense && (
            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-4">
              <select className="input" value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Descrição (ex: Assinatura Canva)"
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  className="input"
                  placeholder="Valor (R$)"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                />
                <input type="date" className="input" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
              </div>
              <button className="btn-primary w-full" onClick={handleAddExpense} disabled={savingExpense}>
                {savingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar despesa
              </button>
            </div>
          )}

          {expenses.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Nenhuma despesa registrada neste mês.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {e.description || e.category}
                    </p>
                    <p className="text-xs text-slate-400">
                      {e.category} · {formatDateLong(new Date(e.date))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(e.amount)}</span>
                    <button
                      className="text-slate-400 hover:text-red-600"
                      onClick={() => setDeleteExpenseId(e.id)}
                      aria-label="Excluir despesa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteRevenueId)}
        title="Excluir receita?"
        description="Esse registro será removido permanentemente."
        confirmLabel="Excluir"
        loading={deletingRevenue}
        onConfirm={handleDeleteRevenue}
        onCancel={() => setDeleteRevenueId(null)}
      />
      <ConfirmDialog
        open={Boolean(deleteExpenseId)}
        title="Excluir despesa?"
        description="Esse registro será removido permanentemente."
        confirmLabel="Excluir"
        loading={deletingExpense}
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteExpenseId(null)}
      />
    </div>
  );
}
