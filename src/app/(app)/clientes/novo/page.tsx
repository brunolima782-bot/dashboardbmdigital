import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientForm from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link href="/clientes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para clientes
        </Link>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo cliente</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Cadastre um novo cliente para gerenciar seus investimentos em tráfego pago.</p>
      </div>
      <ClientForm />
    </div>
  );
}
