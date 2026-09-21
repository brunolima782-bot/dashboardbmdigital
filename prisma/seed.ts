import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

type Platform = "META" | "GOOGLE" | "LINKEDIN";

const prisma = new PrismaClient();

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2) {
  const v = Math.random() * (max - min) + min;
  return Number(v.toFixed(decimals));
}

async function main() {
  console.log("Iniciando seed...");

  // Configurações da agência
  const existingSettings = await prisma.agencySettings.findFirst();
  if (!existingSettings) {
    await prisma.agencySettings.create({
      data: {
        agencyName: "BM Digital",
        primaryColor: "#0f66dd",
        logoUrl: "/brand/bbm-digital-icon.jpeg",
      },
    });
  }

  // Usuário administrador de testes
  const adminEmail = "admin@agencia.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Usuário administrador criado: ${adminEmail} / senha: admin123`);
  }

  // Cliente demonstrativo
  const demoClientName = "Mega Sol Piscinas";
  let client = await prisma.client.findFirst({ where: { companyName: demoClientName } });
  if (!client) {
    client = await prisma.client.create({
      data: {
        companyName: demoClientName,
        contactName: "Carlos Andrade",
        email: "contato@megasolpiscinas.com.br",
        phone: "(81) 3333-4444",
        whatsapp: "(81) 99999-8888",
        city: "Paulista",
        state: "PE",
        segment: "Piscinas de fibra",
        brandColor: "#0891b2",
        notes: "Cliente demonstrativo criado automaticamente para fins de apresentação do sistema.",
        status: "ACTIVE",
      },
    });
    console.log(`Cliente demonstrativo criado: ${demoClientName}`);
  }

  // Segundo cliente demonstrativo (para a visão geral da agência)
  const demoClientName2 = "Studio Bella Estética";
  let client2 = await prisma.client.findFirst({ where: { companyName: demoClientName2 } });
  if (!client2) {
    client2 = await prisma.client.create({
      data: {
        companyName: demoClientName2,
        contactName: "Fernanda Lima",
        email: "contato@studiobella.com.br",
        phone: "(11) 4444-5555",
        whatsapp: "(11) 98888-7777",
        city: "São Paulo",
        state: "SP",
        segment: "Estética e beleza",
        brandColor: "#db2777",
        notes: "Cliente demonstrativo criado automaticamente para fins de apresentação do sistema.",
        status: "ACTIVE",
      },
    });
    console.log(`Cliente demonstrativo criado: ${demoClientName2}`);
  }

  const clients = [client, client2];
  const platforms: { platform: Platform; campaigns: string[] }[] = [
    { platform: "META", campaigns: ["Piscina Ágata - Leads", "Remarketing Catálogo", "Institucional Marca"] },
    { platform: "GOOGLE", campaigns: ["Rede de Pesquisa - Piscinas", "Performance Max", "Remarketing Display"] },
    { platform: "LINKEDIN", campaigns: ["Geração de Leads B2B"] },
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  for (const cli of clients) {
    const existingInvestments = await prisma.investment.count({ where: { clientId: cli.id } });
    if (existingInvestments > 0) continue;

    // Orçamentos: mês atual e mês anterior
    for (const offset of [0, -1]) {
      const d = new Date(currentYear, currentMonth + offset, 1);
      await prisma.budget.upsert({
        where: {
          clientId_month_year: {
            clientId: cli.id,
            month: d.getMonth() + 1,
            year: d.getFullYear(),
          },
        },
        update: {},
        create: {
          clientId: cli.id,
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          amount: cli.id === client.id ? 10000 : 6000,
        },
      });
    }

    // Investimentos: mês atual e mês anterior, dados diários por plataforma
    for (const offset of [0, -1]) {
      const monthDate = new Date(currentYear, currentMonth + offset, 1);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      // Limita ao dia atual se for o mês corrente
      const maxDay = offset === 0 ? now.getDate() : daysInMonth;

      for (const p of platforms) {
        // LinkedIn só para o cliente 2 (B2B), simulando segmentação real
        if (p.platform === "LINKEDIN" && cli.id === client.id) continue;

        const entriesThisMonth = randInt(6, 10);
        for (let i = 0; i < entriesThisMonth; i++) {
          const day = randInt(1, maxDay);
          const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          const campaignName = p.campaigns[randInt(0, p.campaigns.length - 1)];

          const amount = randFloat(80, 450);
          const impressions = randInt(2000, 30000);
          const clicks = randInt(Math.round(impressions * 0.005), Math.round(impressions * 0.03));
          const leads = randInt(1, Math.max(1, Math.round(clicks * 0.15)));
          const conversions = randInt(0, leads);
          const conversionValue = conversions * randFloat(150, 600);

          await prisma.investment.create({
            data: {
              clientId: cli.id,
              platform: p.platform,
              campaignName,
              date,
              amount,
              impressions,
              reach: Math.round(impressions * randFloat(0.6, 0.9)),
              clicks,
              leads,
              conversions,
              conversionValue,
              notes: "Dado demonstrativo gerado automaticamente.",
              isDemo: true,
            },
          });
        }
      }
    }
  }

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
