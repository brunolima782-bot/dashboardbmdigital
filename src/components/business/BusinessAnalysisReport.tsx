import { CheckCircle2, AlertTriangle, Trophy } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  BusinessProfileData,
  CompetitorData,
  generateStrengthsAndWeaknesses,
  compareToCompetitors,
  recommendStrategy,
} from "@/lib/businessAnalysis";

const PLATFORM_LABELS: Record<string, string> = {
  GOOGLE: "Google Ads",
  META: "Meta Ads",
  LINKEDIN: "LinkedIn Ads",
};

const PRIORITY_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  Alta: "success",
  Média: "warning",
  Baixa: "neutral",
  "Não recomendado": "danger",
};

const POSITION_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  Líder: "success",
  "Na média": "warning",
  "Abaixo da concorrência": "danger",
};

export default function BusinessAnalysisReport({
  profile,
  competitors,
}: {
  profile: BusinessProfileData;
  competitors: CompetitorData[];
}) {
  const { strengths, weaknesses } = generateStrengthsAndWeaknesses(profile, competitors);
  const comparison = compareToCompetitors(profile, competitors);
  const strategies = recommendStrategy(profile, weaknesses, comparison.position);

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Diagnóstico do perfil</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-500/5 p-5">
            <p className="text-xs font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mb-3">
              Pontos fortes
            </p>
            {strengths.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum ponto forte destacado ainda.</p>
            ) : (
              <ul className="space-y-2.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-500/5 p-5">
            <p className="text-xs font-semibold tracking-widest text-amber-700 dark:text-amber-400 uppercase mb-3">
              Pontos a melhorar
            </p>
            {weaknesses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum ponto de melhoria identificado.</p>
            ) : (
              <ul className="space-y-2.5">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comparação com concorrentes diretos</h2>
          <Badge variant={POSITION_VARIANT[comparison.position]}>{comparison.position}</Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">{comparison.summary}</p>

        {comparison.rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">Negócio</th>
                  <th className="px-3 py-3 font-medium text-right">Nota</th>
                  <th className="px-3 py-3 font-medium text-right">Avaliações</th>
                  <th className="px-3 py-3 font-medium text-right">Fotos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="bg-brand-50/40 dark:bg-brand-500/5 font-semibold text-slate-900 dark:text-white">
                  <td className="px-4 py-3 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-brand-500" /> {profile.businessName} (você)
                  </td>
                  <td className="px-3 py-3 text-right">{profile.rating.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right">{profile.reviewCount}</td>
                  <td className="px-3 py-3 text-right">{profile.photoCount}</td>
                </tr>
                {comparison.rows.map((c, i) => (
                  <tr key={i} className="text-slate-700 dark:text-slate-300">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-3 py-3 text-right">{c.rating.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right">{c.reviewCount}</td>
                    <td className="px-3 py-3 text-right">{c.photoCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Estratégia de tráfego recomendada</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Prioridade sugerida para cada plataforma com base no diagnóstico acima
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((s) => (
            <div key={s.platform} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{PLATFORM_LABELS[s.platform]}</h4>
                <Badge variant={PRIORITY_VARIANT[s.priority]}>{s.priority}</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.reasoning}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
