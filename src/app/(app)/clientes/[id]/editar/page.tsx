import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ClientForm from "@/components/clients/ClientForm";
import ClientPortalAccess from "@/components/clients/ClientPortalAccess";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          href={`/clientes/${client.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o dashboard do cliente
        </Link>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar cliente</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Atualize os dados de {client.companyName}.</p>
      </div>
      <ClientForm
        initialData={{
          id: client.id,
          companyName: client.companyName,
          contactName: client.contactName,
          email: client.email || "",
          phone: client.phone || "",
          whatsapp: client.whatsapp || "",
          city: client.city || "",
          state: client.state || "",
          segment: client.segment || "",
          logoUrl: client.logoUrl || "",
          brandColor: client.brandColor,
          notes: client.notes || "",
          status: client.status as "ACTIVE" | "INACTIVE",
        }}
      />
      <ClientPortalAccess clientId={client.id} suggestedEmail={client.email || ""} />
    </div>
  );
}
