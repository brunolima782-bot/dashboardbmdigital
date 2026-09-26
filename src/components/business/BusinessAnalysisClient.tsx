"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import ExportPdfButton from "@/components/reports/ExportPdfButton";
import BusinessAnalysisReport from "./BusinessAnalysisReport";
import type { BusinessProfileData, CompetitorData } from "@/lib/businessAnalysis";

function parseBRFloat(value: string): number {
  const cleaned = value.replace(",", ".").replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseBRInt(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(/[^\d-]/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

type CompetitorFormRow = { key: string; name: string; rating: string; reviewCount: string; photoCount: string };

type SavedProfile = { profile: BusinessProfileData; competitors: CompetitorData[] };

function toCompetitorFormRow(c?: CompetitorData): CompetitorFormRow {
  return {
    key: Math.random().toString(36).slice(2),
    name: c?.name ?? "",
    rating: c?.rating ? c.rating.toString().replace(".", ",") : "",
    reviewCount: c?.reviewCount ? String(c.reviewCount) : "",
    photoCount: c?.photoCount ? String(c.photoCount) : "",
  };
}

export default function BusinessAnalysisClient({
  clientId,
  clientName,
  agencyName,
  initialData,
}: {
  clientId: string;
  clientName: string;
  agencyName: string;
  initialData: SavedProfile | null;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [savedProfile, setSavedProfile] = useState<SavedProfile | null>(initialData);

  const [businessName, setBusinessName] = useState(initialData?.profile.businessName ?? clientName);
  const [category, setCategory] = useState(initialData?.profile.category ?? "");
  const [isB2B, setIsB2B] = useState(initialData?.profile.isB2B ?? false);
  const [rating, setRating] = useState(
    initialData?.profile.rating ? initialData.profile.rating.toString().replace(".", ",") : ""
  );
  const [reviewCount, setReviewCount] = useState(initialData?.profile.reviewCount ? String(initialData.profile.reviewCount) : "");
  const [photoCount, setPhotoCount] = useState(initialData?.profile.photoCount ? String(initialData.profile.photoCount) : "");
  const [hasWebsite, setHasWebsite] = useState(initialData?.profile.hasWebsite ?? false);
  const [hasWhatsapp, setHasWhatsapp] = useState(initialData?.profile.hasWhatsapp ?? false);
  const [completeHours, setCompleteHours] = useState(initialData?.profile.completeHours ?? false);
  const [hasDescription, setHasDescription] = useState(initialData?.profile.hasDescription ?? false);
  const [respondsToReviews, setRespondsToReviews] = useState(initialData?.profile.respondsToReviews ?? false);
  const [recentPosts, setRecentPosts] = useState(initialData?.profile.recentPosts ?? false);
  const [competitors, setCompetitors] = useState<CompetitorFormRow[]>(
    initialData && initialData.competitors.length > 0
      ? initialData.competitors.map(toCompetitorFormRow)
      : [toCompetitorFormRow()]
  );

  function updateCompetitor(key: string, field: keyof CompetitorFormRow, value: string) {
    setCompetitors((prev) => prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)));
  }

  function addCompetitor() {
    if (competitors.length >= 10) return;
    setCompetitors((prev) => [...prev, toCompetitorFormRow()]);
  }

  function removeCompetitor(key: string) {
    setCompetitors((prev) => prev.filter((c) => c.key !== key));
  }

  async function handleSave() {
    if (!businessName.trim()) {
      showToast("Informe o nome do negócio", "error");
      return;
    }
    if (!category.trim()) {
      showToast("Informe a categoria do negócio", "error");
      return;
    }

    const payload = {
      businessName: businessName.trim(),
      category: category.trim(),
      isB2B,
      rating: Math.min(5, parseBRFloat(rating)),
      reviewCount: parseBRInt(reviewCount),
      photoCount: parseBRInt(photoCount),
      hasWebsite,
      hasWhatsapp,
      completeHours,
      hasDescription,
      respondsToReviews,
      recentPosts,
      competitors: competitors
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          rating: Math.min(5, parseBRFloat(c.rating)),
          reviewCount: parseBRInt(c.reviewCount),
          photoCount: parseBRInt(c.photoCount),
        })),
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/business-profile/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao salvar análise", "error");
        return;
      }
      setSavedProfile({ profile: payload, competitors: payload.competitors });
      showToast("Análise gerada com sucesso!", "success");
    } catch {
      showToast("Erro de conexão", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/analise-negocio"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>
        {savedProfile && (
          <ExportPdfButton
            elementId="business-analysis-content"
            fileName={`Analise-Negocio-${clientName.replace(/\s+/g, "-")}.pdf`}
            agencyName={agencyName}
            reportTitle={`Análise de Negócio · ${clientName}`}
          />
        )}
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dados do Google Meu Negócio</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Preencha olhando o perfil público do cliente no Google. Esses dados não são buscados
            automaticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nome do negócio *</label>
            <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <label className="label">Categoria / segmento *</label>
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Piscinas de fibra, Clínica de estética..."
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isB2B}
            onChange={(e) => setIsB2B(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Negócio B2B (vende para outras empresas, não para o consumidor final)
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Nota média (0 a 5)</label>
            <input
              type="text"
              inputMode="decimal"
              className="input"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="4,5"
            />
          </div>
          <div>
            <label className="label">Nº de avaliações</label>
            <input
              type="text"
              inputMode="numeric"
              className="input"
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Nº de fotos no perfil</label>
            <input
              type="text"
              inputMode="numeric"
              className="input"
              value={photoCount}
              onChange={(e) => setPhotoCount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
          {[
            { checked: hasWebsite, set: setHasWebsite, label: "Site cadastrado no perfil" },
            { checked: hasWhatsapp, set: setHasWhatsapp, label: "WhatsApp/telefone visível" },
            { checked: completeHours, set: setCompleteHours, label: "Horário de funcionamento completo" },
            { checked: hasDescription, set: setHasDescription, label: "Descrição do negócio preenchida" },
            { checked: respondsToReviews, set: setRespondsToReviews, label: "Responde às avaliações" },
            { checked: recentPosts, set: setRecentPosts, label: "Publica novidades recentemente" },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.set(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              {item.label}
            </label>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Concorrentes diretos</label>
            <button
              type="button"
              onClick={addCompetitor}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
              disabled={competitors.length >= 10}
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar concorrente
            </button>
          </div>
          <div className="space-y-3">
            {competitors.map((c) => (
              <div key={c.key} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
                <input
                  className="input"
                  placeholder="Nome do concorrente"
                  value={c.name}
                  onChange={(e) => updateCompetitor(c.key, "name", e.target.value)}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  className="input w-20"
                  placeholder="Nota"
                  value={c.rating}
                  onChange={(e) => updateCompetitor(c.key, "rating", e.target.value)}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  className="input w-24"
                  placeholder="Avaliações"
                  value={c.reviewCount}
                  onChange={(e) => updateCompetitor(c.key, "reviewCount", e.target.value)}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  className="input w-20"
                  placeholder="Fotos"
                  value={c.photoCount}
                  onChange={(e) => updateCompetitor(c.key, "photoCount", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeCompetitor(c.key)}
                  className="text-slate-400 hover:text-red-600 p-2"
                  aria-label="Remover concorrente"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Analisando..." : "Salvar e gerar análise"}
          </button>
        </div>
      </div>

      {savedProfile && (
        <div id="business-analysis-content" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10">
          <div className="text-center pb-8 mb-8 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
              Análise de Negócio
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {savedProfile.profile.businessName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{savedProfile.profile.category}</p>
          </div>
          <BusinessAnalysisReport profile={savedProfile.profile} competitors={savedProfile.competitors} />
        </div>
      )}
    </div>
  );
}
