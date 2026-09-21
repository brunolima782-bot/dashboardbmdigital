import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const settings = await prisma.agencySettings.findFirst();
  const agencyName = settings?.agencyName || "Minha Agência";
  const logoUrl = settings?.logoUrl;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-surface-dark">
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <Sidebar agencyName={agencyName} logoUrl={logoUrl} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar agencyName={agencyName} logoUrl={logoUrl} userName={session.name} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
