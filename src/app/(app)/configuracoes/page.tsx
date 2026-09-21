import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings = await prisma.agencySettings.findFirst();
  if (!settings) {
    settings = await prisma.agencySettings.create({ data: { agencyName: "Minha Agência" } });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configurações</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Personalize a identidade da sua agência no sistema.</p>
      </div>
      <SettingsForm
        initialAgencyName={settings.agencyName}
        initialLogoUrl={settings.logoUrl || ""}
        initialPrimaryColor={settings.primaryColor}
      />
    </div>
  );
}
