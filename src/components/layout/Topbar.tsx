"use client";

import { useState } from "react";
import { Menu, User } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Topbar({
  agencyName,
  logoUrl,
  userName,
}: {
  agencyName: string;
  logoUrl?: string | null;
  userName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur px-4 py-3.5 dark:bg-surface-dark/80 dark:border-slate-800 lg:px-8">
        <button
          className="lg:hidden text-slate-500"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
            Dashboard de Tráfego Pago
          </h1>
          <p className="text-xs text-slate-400">{agencyName}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</span>
            <span className="text-xs text-slate-400">Administrador</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            <User className="h-4.5 w-4.5" />
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 animate-fade-in">
            <Sidebar agencyName={agencyName} logoUrl={logoUrl} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
