"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardCopy, Printer, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import {
  CHECKLIST_ITEMS,
  SECTIONS,
  ChecklistAnswer,
  calculateChecklistResult,
  sectionResult,
} from "@/lib/profileChecklist";

const STATUS_STYLE: Record<string, { ring: string; badge: "danger" | "warning" | "brand" | "success" }> = {
  "Crítico": { ring: "#dc2626", badge: "danger" },
  "Regular": { ring: "#d97706", badge: "warning" },
  "Bom": { ring: "#0f66dd", badge: "brand" },
  "Excelente": { ring: "#059669", badge: "success" },
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative h-[140px] w-[140px] flex-shrink-0">
      <svg width={140} height={140} viewBox="0 0 140 140" className="-rotate-90">
        <circle cx={70} cy={70} r={radius} fill="none" stroke="currentColor" strokeWidth={14} className="text-slate-100 dark:text-slate-800" />
        <circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
    </div>
  );
}

export default function ProfileChecklistClient({
  clientId,
  clientName,
  initialCompanyName,
  initialCityNeighborhood,
  initialEvaluatedBy,
  initialAnswers,
}: {
  clientId: string;
  clientName: string;
  initialCompanyName: string;
  initialCityNeighborhood: string;
  initialEvaluatedBy: string;
  initialAnswers: Record<string, ChecklistAnswer>;
}) {
  const { showToast } = useToast();
  const [companyName, setCompanyName] = useState(initialCompanyName || clientName);
  const [cityNeighborhood, setCityNeighborhood] = useState(initialCityNeighborhood);
  const [evaluatedBy, setEvaluatedBy] = useState(initialEvaluatedBy);
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer>>(initialAnswers);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(true);

  const result = calculateChecklistResult(answers);
  const statusStyle = STATUS_STYLE[result.status];

  function scheduleSave(next: {
    companyName: string;
    cityNeighborhood: string;
    evaluatedBy: string;
    answers: Record<string, ChecklistAnswer>;
  }) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await fetch(`/api/profile-checklist/${clientId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
      } catch {
        showToast("Não foi possível salvar a avaliação agora", "error");
      }
    }, 700);
  }

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    scheduleSave({ companyName, cityNeighborhood, evaluatedBy, answers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, cityNeighborhood, evaluatedBy, answers]);

  function setAnswer(id: string, value: ChecklistAnswer) {
    setAnswers((prev) => {
      const next = { ...prev };
      if (prev[id] === value) {
        delete next[id];
      } else {
        next[id] = value;
      }
      return next;
    });
  }

  async function handleClear() {
    setClearing(true);
    try {
      await fetch(`/api/profile-checklist/${clientId}`, { method: "DELETE" });
      skipNextSave.current = true;
      setAnswers({});
      showToast("Avaliação limpa", "success");
      setClearOpen(false);
    } catch {
      showToast("Erro ao limpar avaliação", "error");
    } finally {
      setClearing(false);
    }
  }

  function handleCopy() {
    const lines: string[] = [];
    lines.push(`Avaliador de Perfil Google — ${companyName || clientName}`);
    if (cityNeighborhood) lines.push(`Cidade/Bairro: ${cityNeighborhood}`);
    if (evaluatedBy) lines.push(`Avaliado por: ${evaluatedBy}`);
    lines.push(`Nota: ${result.score}/100 (${result.status})`);
    lines.push("");
    if (result.pending.length > 0) {
      lines.push("Pendências, da mais importante para a menos importante:");
      result.pending.forEach((item, idx) => {
        const tag = item.state === "NAO_TEM" ? "não tem" : "não avaliado";
        lines.push(`${idx + 1}. ${item.label} (${item.points} pts, ${tag})`);
        if (item.description) lines.push(`   ${item.description}`);
      });
    } else {
      lines.push("Nenhuma pendência — perfil completo.");
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      showToast("Relatório copiado!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Avaliador de Perfil Google</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Marque o que o perfil da empresa já tem. A nota e o diagnóstico atualizam na hora.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {result.score}
              <span className="text-sm text-slate-400">/100</span>
            </span>
            <Badge variant={statusStyle.badge}>{result.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <div>
            <label className="label">Empresa</label>
            <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="label">Cidade / Bairro</label>
            <input
              className="input"
              value={cityNeighborhood}
              onChange={(e) => setCityNeighborhood(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Avaliado por</label>
            <input className="input" value={evaluatedBy} onChange={(e) => setEvaluatedBy(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Cada item tem um peso. Os pesos somam 100. Itens marcados como &quot;não se aplica&quot; saem da
          conta e a nota é recalculada sobre o que sobrou.
        </p>
      </div>

      {SECTIONS.map((section) => {
        const items = CHECKLIST_ITEMS.filter((i) => i.section === section);
        const { earned, possible } = sectionResult(section, answers);
        return (
          <div key={section} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{section}</h3>
              <span className="text-xs text-slate-400">
                {earned}/{possible} pts
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => {
                const current = answers[item.id];
                return (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.label} <span className="text-xs text-slate-400 font-normal">{item.points} pts</span>
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setAnswer(item.id, "TEM")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          current === "TEM"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        Tem
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswer(item.id, "NAO_TEM")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          current === "NAO_TEM"
                            ? "bg-red-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        Não tem
                      </button>
                      {item.allowNotApplicable && (
                        <button
                          type="button"
                          onClick={() => setAnswer(item.id, "NAO_SE_APLICA")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            current === "NAO_SE_APLICA"
                              ? "bg-slate-500 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          Não se aplica
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div id="checklist-diagnostico" className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Diagnóstico</h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <ScoreRing score={result.score} color={statusStyle.ring} />
          <div className="flex-1 space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">{result.score}% do que o perfil já tem</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="text-slate-600 dark:text-slate-300">{100 - result.score}% do que ainda falta</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {result.pending.length === 0 ? (
            <p className="text-sm text-emerald-600 font-medium">Nenhuma pendência — perfil completo!</p>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {result.pendingNaoTemCount} pendência{result.pendingNaoTemCount !== 1 ? "s" : ""}, da mais
                importante para a menos importante
                {result.pendingNaoAvaliadoCount > 0
                  ? ` (${result.pendingNaoAvaliadoCount} itens ainda sem resposta)`
                  : ""}
                .
              </p>
              <ol className="space-y-3">
                {result.pending.map((item, idx) => (
                  <li key={item.id} className="text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {idx + 1}. {item.label}
                      </span>
                      <Badge variant={item.points >= 5 ? "danger" : item.points >= 3 ? "warning" : "neutral"}>
                        {item.points >= 5 ? "Alta" : item.points >= 3 ? "Média" : "Baixa"} · {item.points} pts
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 p-3.5 text-xs text-amber-800 dark:text-amber-300">
          Antes de mexer no perfil: espere 5 dias depois de pegar o acesso ao Google Business Profile para
          fazer alterações. E nunca publique mais de 3 fotos no mesmo dia.
        </div>

        <div className="mt-6 flex flex-wrap gap-2" data-pdf-hide>
          <button className="btn-primary" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
            Copiar relatório
          </button>
          <button className="btn-secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir
          </button>
          <button className="btn-secondary" onClick={() => setClearOpen(true)}>
            <RotateCcw className="h-4 w-4" /> Limpar avaliação
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Limpar avaliação?"
        description="Todas as respostas marcadas para esse cliente serão apagadas."
        confirmLabel="Limpar"
        loading={clearing}
        onConfirm={handleClear}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  );
}
