"use client";

import Link from "next/link";
import { Search, CheckCircle2, ArrowRight } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

type ClientRow = {
  id: string;
  companyName: string;
  segment: string | null;
  businessProfile: { id: string } | null;
};

export default function BusinessAnalysisSelector({ clients }: { clients: ClientRow[] }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Análise de Negócio</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Informe os dados do Google Meu Negócio do cliente e dos concorrentes diretos para gerar um
          diagnóstico completo com pontos de melhoria, comparação com a concorrência e a melhor estratégia de
          tráfego pago para cada plataforma.
        </p>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum cliente cadastrado"
          description="Cadastre um cliente para começar a análise de negócio."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/analise-negocio/${c.id}`}
              className="card card-hover p-5 flex flex-col gap-3"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{c.companyName}</p>
                <p className="text-xs text-slate-400">{c.segment || "Segmento não informado"}</p>
              </div>
              <div className="mt-auto flex items-center justify-between text-sm">
                {c.businessProfile ? (
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Análise já cadastrada
                  </span>
                ) : (
                  <span className="text-slate-400">Ainda sem análise</span>
                )}
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
