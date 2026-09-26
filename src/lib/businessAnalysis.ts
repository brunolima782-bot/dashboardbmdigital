export type BusinessProfileData = {
  businessName: string;
  category: string;
  isB2B: boolean;
  rating: number;
  reviewCount: number;
  photoCount: number;
  hasWebsite: boolean;
  hasWhatsapp: boolean;
  completeHours: boolean;
  hasDescription: boolean;
  respondsToReviews: boolean;
  recentPosts: boolean;
};

export type CompetitorData = {
  name: string;
  rating: number;
  reviewCount: number;
  photoCount: number;
};

export type Platform = "GOOGLE" | "META" | "LINKEDIN";

export type PlatformStrategy = {
  platform: Platform;
  priority: "Alta" | "Média" | "Baixa" | "Não recomendado";
  reasoning: string;
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function generateStrengthsAndWeaknesses(
  profile: BusinessProfileData,
  competitors: CompetitorData[]
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const competitorAvgRating = avg(competitors.map((c) => c.rating));
  const competitorAvgReviews = avg(competitors.map((c) => c.reviewCount));

  // Nota
  if (profile.rating > 0) {
    if (profile.rating >= 4.6) {
      strengths.push(`Nota muito alta (${profile.rating.toFixed(1)}) — forte sinal de confiança para quem pesquisa antes de comprar.`);
    } else if (profile.rating < 4.0) {
      weaknesses.push(`Nota abaixo do ideal (${profile.rating.toFixed(1)}) — notas menores que 4.0 afastam boa parte dos clientes em potencial antes mesmo do primeiro contato.`);
    } else if (competitorAvgRating > 0 && profile.rating < competitorAvgRating - 0.2) {
      weaknesses.push(`Nota (${profile.rating.toFixed(1)}) abaixo da média dos concorrentes analisados (${competitorAvgRating.toFixed(1)}).`);
    }
  } else {
    weaknesses.push("Perfil ainda sem avaliações — dificulta a decisão de novos clientes que comparam opções no Google.");
  }

  // Avaliações
  if (competitors.length > 0 && competitorAvgReviews > 0) {
    const gap = ((profile.reviewCount - competitorAvgReviews) / competitorAvgReviews) * 100;
    if (gap <= -30) {
      weaknesses.push(
        `Volume de avaliações (${profile.reviewCount}) bem abaixo da média dos concorrentes (${Math.round(competitorAvgReviews)}) — menos avaliações reduz a confiança e o posicionamento no Google.`
      );
    } else if (gap >= 30) {
      strengths.push(
        `Volume de avaliações (${profile.reviewCount}) bem acima da média dos concorrentes (${Math.round(competitorAvgReviews)}) — vantagem competitiva relevante.`
      );
    }
  } else if (profile.reviewCount < 10) {
    weaknesses.push(`Poucas avaliações registradas (${profile.reviewCount}) — dificulta a construção de confiança para novos clientes.`);
  }

  // Fotos
  if (profile.photoCount < 10) {
    weaknesses.push(`Poucas fotos no perfil (${profile.photoCount}) — perfis com mais fotos recebem mais cliques e ligações no Google.`);
  } else if (profile.photoCount >= 30) {
    strengths.push(`Perfil bem ilustrado (${profile.photoCount} fotos) — ajuda o cliente a se decidir antes mesmo de entrar em contato.`);
  }

  // Sinais de completude do perfil
  if (!profile.hasWebsite) weaknesses.push("Sem site cadastrado no perfil — perde uma via direta de conversão para quem pesquisa.");
  if (!profile.hasWhatsapp) weaknesses.push("Sem WhatsApp/telefone visível no perfil — dificulta o contato rápido do cliente.");
  if (!profile.completeHours) weaknesses.push("Horário de funcionamento incompleto ou não informado.");
  if (!profile.hasDescription) weaknesses.push("Descrição do negócio não preenchida — é um espaço gratuito para reforçar diferenciais.");
  if (!profile.respondsToReviews) weaknesses.push("Não responde às avaliações — responder (inclusive as negativas) melhora a percepção de cuidado com o cliente.");
  if (!profile.recentPosts) weaknesses.push("Sem publicações recentes no perfil — postagens recorrentes ajudam a manter o perfil ativo aos olhos do Google.");

  if (profile.hasWebsite && profile.hasWhatsapp && profile.completeHours && profile.hasDescription) {
    strengths.push("Perfil completo: site, contato, horários e descrição preenchidos corretamente.");
  }
  if (profile.respondsToReviews) strengths.push("Responde às avaliações dos clientes — reforça confiança para quem está pesquisando.");
  if (profile.recentPosts) strengths.push("Mantém publicações recentes no perfil, sinalizando atividade ao Google.");

  return { strengths, weaknesses };
}

export type CompetitorComparisonRow = CompetitorData & {
  ratingDiff: number;
  reviewDiff: number;
  photoDiff: number;
};

export function compareToCompetitors(
  profile: BusinessProfileData,
  competitors: CompetitorData[]
): { rows: CompetitorComparisonRow[]; position: "Líder" | "Na média" | "Abaixo da concorrência"; summary: string } {
  const rows: CompetitorComparisonRow[] = competitors.map((c) => ({
    ...c,
    ratingDiff: profile.rating - c.rating,
    reviewDiff: profile.reviewCount - c.reviewCount,
    photoDiff: profile.photoCount - c.photoCount,
  }));

  if (competitors.length === 0) {
    return { rows, position: "Na média", summary: "Nenhum concorrente cadastrado ainda para comparação." };
  }

  const winsOnRating = rows.filter((r) => r.ratingDiff > 0).length;
  const winsOnReviews = rows.filter((r) => r.reviewDiff > 0).length;
  const score = winsOnRating + winsOnReviews;
  const maxScore = competitors.length * 2;

  let position: "Líder" | "Na média" | "Abaixo da concorrência";
  if (score >= maxScore * 0.7) position = "Líder";
  else if (score >= maxScore * 0.35) position = "Na média";
  else position = "Abaixo da concorrência";

  const summaryMap = {
    "Líder": `${profile.businessName} está à frente da maioria dos concorrentes diretos analisados em nota e/ou volume de avaliações.`,
    "Na média": `${profile.businessName} está equilibrado com a concorrência — há espaço para se diferenciar em nota, avaliações ou completude do perfil.`,
    "Abaixo da concorrência": `${profile.businessName} está atrás da maioria dos concorrentes analisados — reforçar a reputação no Google deve vir antes de escalar o investimento em anúncios.`,
  };

  return { rows, position, summary: summaryMap[position] };
}

export function recommendStrategy(
  profile: BusinessProfileData,
  weaknesses: string[],
  position: "Líder" | "Na média" | "Abaixo da concorrência"
): PlatformStrategy[] {
  const reputationWeak = profile.rating > 0 && profile.rating < 4.0;
  const strategies: PlatformStrategy[] = [];

  // Google Ads
  if (reputationWeak) {
    strategies.push({
      platform: "GOOGLE",
      priority: "Média",
      reasoning:
        "O Google Ads costuma trazer resultado rápido para quem já está pesquisando o serviço, mas com a nota atual, parte do tráfego pago pode ser perdida na hora da decisão. Recomenda-se iniciar com orçamento controlado enquanto a reputação é trabalhada.",
    });
  } else {
    strategies.push({
      platform: "GOOGLE",
      priority: "Alta",
      reasoning:
        "Ideal para captar clientes que já estão pesquisando ativamente o serviço (alta intenção de compra). Com o perfil e a reputação atuais, tende a converter bem.",
    });
  }

  // Meta Ads
  if (profile.photoCount < 10) {
    strategies.push({
      platform: "META",
      priority: "Média",
      reasoning:
        "O Meta Ads depende muito de bons criativos visuais. Com poucas fotos disponíveis hoje, vale investir em produção de imagens/vídeos antes de escalar o investimento nessa plataforma.",
    });
  } else {
    strategies.push({
      platform: "META",
      priority: profile.isB2B ? "Baixa" : "Alta",
      reasoning: profile.isB2B
        ? "Para negócios B2B, o Meta Ads tende a gerar menos leads qualificados do que Google ou LinkedIn — pode ser usado como reforço de marca, mas não como prioridade."
        : "Bom canal para gerar demanda nova (quem ainda não conhece o negócio), aproveitando o acervo de fotos já disponível no perfil.",
    });
  }

  // LinkedIn Ads
  if (profile.isB2B) {
    strategies.push({
      platform: "LINKEDIN",
      priority: "Alta",
      reasoning: "Para negócios B2B, o LinkedIn Ads costuma trazer os leads mais qualificados, apesar do custo por clique mais alto.",
    });
  } else {
    strategies.push({
      platform: "LINKEDIN",
      priority: "Não recomendado",
      reasoning: "Para negócios voltados ao consumidor final (B2C), o LinkedIn Ads tende a ter custo alto e baixo retorno — não é prioridade neste caso.",
    });
  }

  if (position === "Abaixo da concorrência") {
    strategies.forEach((s) => {
      if (s.priority === "Alta") s.priority = "Média";
    });
  }

  return strategies;
}
