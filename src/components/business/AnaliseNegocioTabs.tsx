"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, BarChart3 } from "lucide-react";
import ProfileChecklistClient from "./ProfileChecklistClient";
import BusinessAnalysisClient from "./BusinessAnalysisClient";
import type { ChecklistAnswer } from "@/lib/profileChecklist";
import type { BusinessProfileData, CompetitorData } from "@/lib/businessAnalysis";

export default function AnaliseNegocioTabs({
  clientId,
  clientName,
  agencyName,
  checklistData,
  businessAnalysisData,
}: {
  clientId: string;
  clientName: string;
  agencyName: string;
  checklistData: {
    companyName: string;
    cityNeighborhood: string;
    evaluatedBy: string;
    answers: Record<string, ChecklistAnswer>;
  };
  businessAnalysisData: { profile: BusinessProfileData; competitors: CompetitorData[] } | null;
}) {
  const [tab, setTab] = useState<"checklist" | "comparacao">("checklist");

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/analise-negocio"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </Link>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab("checklist")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "checklist"
              ? "border-brand-600 text-brand-700 dark:text-brand-300"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <ClipboardList className="h-4 w-4" /> Avaliador de Perfil Google
        </button>
        <button
          onClick={() => setTab("comparacao")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "comparacao"
              ? "border-brand-600 text-brand-700 dark:text-brand-300"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Comparação com concorrentes
        </button>
      </div>

      {tab === "checklist" ? (
        <ProfileChecklistClient
          clientId={clientId}
          clientName={clientName}
          initialCompanyName={checklistData.companyName}
          initialCityNeighborhood={checklistData.cityNeighborhood}
          initialEvaluatedBy={checklistData.evaluatedBy}
          initialAnswers={checklistData.answers}
        />
      ) : (
        <BusinessAnalysisClient
          clientId={clientId}
          clientName={clientName}
          agencyName={agencyName}
          initialData={businessAnalysisData}
        />
      )}
    </div>
  );
}
