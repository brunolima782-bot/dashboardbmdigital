export type ChecklistAnswer = "TEM" | "NAO_TEM" | "NAO_SE_APLICA";

export type ChecklistItem = {
  id: string;
  section: string;
  label: string;
  points: number;
  description?: string;
  allowNotApplicable?: boolean;
};

export const SECTIONS = [
  "Dados básicos",
  "Descrição da empresa",
  "Serviços",
  "Perguntas e respostas",
  "Avaliações",
  "Postagens",
  "Fotos e vídeo",
] as const;

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Dados básicos — 35 pts
  {
    id: "nome_otimizado",
    section: "Dados básicos",
    label: "Nome do negócio otimizado",
    points: 6,
    description: "Nome da empresa + no máximo 1 palavra-chave, só se couber naturalmente. Até 98 caracteres.",
  },
  {
    id: "categoria_principal",
    section: "Dados básicos",
    label: "Categoria principal correta",
    points: 7,
    description: "A categoria que melhor descreve a atividade principal.",
  },
  {
    id: "categorias_adicionais",
    section: "Dados básicos",
    label: "Categorias adicionais (até 5)",
    points: 3,
    description: "Categorias secundárias que existem no Google para o nicho.",
  },
  { id: "telefone", section: "Dados básicos", label: "Telefone cadastrado", points: 3 },
  {
    id: "site",
    section: "Dados básicos",
    label: "Site cadastrado",
    points: 3,
    description: "Se a empresa não tem site, marque \"não se aplica\".",
    allowNotApplicable: true,
  },
  {
    id: "endereco",
    section: "Dados básicos",
    label: "Endereço ou áreas de atendimento",
    points: 6,
    description: "Endereço físico visível ou, para quem atende fora do ponto, cidades e bairros de atuação.",
  },
  {
    id: "horario_funcionamento",
    section: "Dados básicos",
    label: "Horário de funcionamento",
    points: 4,
    description: "Dias e horários preenchidos e corretos.",
  },
  {
    id: "horario_feriados",
    section: "Dados básicos",
    label: "Horários especiais para feriados",
    points: 2,
    description: "Feriados do ano corrente definidos.",
    allowNotApplicable: true,
  },
  { id: "data_fundacao", section: "Dados básicos", label: "Data de fundação", points: 1 },

  // Descrição da empresa — 12 pts
  {
    id: "descricao_preenchida",
    section: "Descrição da empresa",
    label: "Descrição preenchida",
    points: 4,
    description: "Até 750 caracteres, tom profissional, direto e confiável.",
  },
  {
    id: "descricao_keyword_local",
    section: "Descrição da empresa",
    label: "Descrição com palavra-chave principal e localidade",
    points: 4,
    description: 'Ex.: "clínica de estética em Moema". Mais 3 a 5 palavras-chave secundárias.',
  },
  {
    id: "descricao_servicos_diferencial",
    section: "Descrição da empresa",
    label: "Descrição cita serviços principais e diferencial",
    points: 2,
  },
  {
    id: "descricao_cta",
    section: "Descrição da empresa",
    label: "Descrição termina com chamada para ação",
    points: 1,
    description: "Ligue, agende, peça um orçamento.",
  },
  {
    id: "descricao_sem_emoji",
    section: "Descrição da empresa",
    label: "Descrição sem emojis e sem excesso de palavra-chave",
    points: 1,
  },

  // Serviços — 8 pts
  {
    id: "servicos_cadastrados",
    section: "Serviços",
    label: "Serviços cadastrados",
    points: 5,
    description: "Todos os serviços ou produtos do negócio na aba de serviços.",
  },
  {
    id: "servicos_com_descricao",
    section: "Serviços",
    label: "Cada serviço com descrição",
    points: 3,
    description: "1 a 2 frases, com palavra-chave de apoio quando natural.",
  },

  // Perguntas e respostas — 7 pts
  {
    id: "perguntas_publicadas",
    section: "Perguntas e respostas",
    label: "Perguntas e respostas publicadas",
    points: 5,
    description: "Entre 10 e 15 perguntas que um cliente real faria antes de contratar.",
  },
  {
    id: "perguntas_com_keyword",
    section: "Perguntas e respostas",
    label: "Perguntas e respostas com palavras-chave",
    points: 2,
    description: "Cada pergunta e cada resposta com pelo menos 1 palavra-chave.",
  },

  // Avaliações — 13 pts
  { id: "avaliacoes_respondidas", section: "Avaliações", label: "Todas as avaliações respondidas", points: 6 },
  {
    id: "avaliacoes_resposta_qualidade",
    section: "Avaliações",
    label: "Respostas agradecem, citam o serviço e convidam a voltar",
    points: 2,
    description: "Nas negativas: empatia e abertura para resolver.",
  },
  {
    id: "avaliacoes_rotina_pedido",
    section: "Avaliações",
    label: "Rotina de pedir avaliações com comentário",
    points: 4,
    description: "Clientes são incentivados a avaliar e escrever, não só dar estrelas.",
  },
  {
    id: "avaliacoes_fotos",
    section: "Avaliações",
    label: "Clientes incentivados a publicar fotos",
    points: 1,
  },

  // Postagens — 8 pts
  { id: "postagem_ao_menos_uma", section: "Postagens", label: "Ao menos uma postagem publicada", points: 3 },
  {
    id: "postagem_recente_frequente",
    section: "Postagens",
    label: "Postagens recentes e frequentes",
    points: 4,
    description: "Uma por semana, com a última publicada no último mês.",
  },
  {
    id: "postagem_keyword_botao",
    section: "Postagens",
    label: "Postagens com palavras-chave e botão de ação",
    points: 1,
    description: "Saiba mais, Ligar, Reservar.",
  },

  // Fotos e vídeo — 17 pts
  { id: "foto_logo", section: "Fotos e vídeo", label: "Logotipo enviado", points: 3 },
  { id: "foto_capa", section: "Fotos e vídeo", label: "Foto de capa", points: 3 },
  {
    id: "foto_fachada",
    section: "Fotos e vídeo",
    label: "Foto da fachada ou vitrine",
    points: 2,
    description: 'Sem ponto físico? Marque "não se aplica".',
    allowNotApplicable: true,
  },
  {
    id: "foto_servicos",
    section: "Fotos e vídeo",
    label: "Fotos dos serviços ou produtos",
    points: 3,
    description: "Pelo menos uma por serviço principal.",
  },
  {
    id: "foto_ambiente",
    section: "Fotos e vídeo",
    label: "Fotos do ambiente interno",
    points: 1,
    allowNotApplicable: true,
  },
  { id: "foto_equipe", section: "Fotos e vídeo", label: "Fotos da equipe ou do atendimento", points: 1 },
  {
    id: "video_institucional",
    section: "Fotos e vídeo",
    label: "Vídeo institucional ou de apresentação",
    points: 2,
  },
  {
    id: "arquivos_nomes_otimizados",
    section: "Fotos e vídeo",
    label: "Arquivos com nomes otimizados",
    points: 2,
    description: "palavras-chave-separadas-por-hifen.jpg, ex.: massagem-relaxante-clinica-isabela-moema-sp.jpg",
  },
];

export const TOTAL_POSSIBLE_POINTS = CHECKLIST_ITEMS.reduce((s, i) => s + i.points, 0); // 100

export function itemsBySection(section: string) {
  return CHECKLIST_ITEMS.filter((i) => i.section === section);
}

export type ScoreStatus = "Crítico" | "Regular" | "Bom" | "Excelente";

export function scoreStatus(score: number): ScoreStatus {
  if (score < 40) return "Crítico";
  if (score < 70) return "Regular";
  if (score < 90) return "Bom";
  return "Excelente";
}

export type PendingItem = ChecklistItem & { state: "NAO_TEM" | "NAO_AVALIADO" };

export function calculateChecklistResult(answers: Record<string, ChecklistAnswer>) {
  let totalWeight = 0;
  let earned = 0;
  const pendingNaoTem: PendingItem[] = [];
  const pendingNaoAvaliado: PendingItem[] = [];

  for (const item of CHECKLIST_ITEMS) {
    const answer = answers[item.id];
    if (answer === "NAO_SE_APLICA") continue;

    totalWeight += item.points;

    if (answer === "TEM") {
      earned += item.points;
    } else if (answer === "NAO_TEM") {
      pendingNaoTem.push({ ...item, state: "NAO_TEM" });
    } else {
      pendingNaoAvaliado.push({ ...item, state: "NAO_AVALIADO" });
    }
  }

  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;
  const pending = [...pendingNaoTem, ...pendingNaoAvaliado].sort((a, b) => b.points - a.points);

  return {
    score,
    earned,
    totalWeight,
    status: scoreStatus(score),
    pending,
    pendingNaoTemCount: pendingNaoTem.length,
    pendingNaoAvaliadoCount: pendingNaoAvaliado.length,
  };
}

export function sectionResult(section: string, answers: Record<string, ChecklistAnswer>) {
  const items = itemsBySection(section);
  let possible = 0;
  let earned = 0;
  for (const item of items) {
    const answer = answers[item.id];
    if (answer === "NAO_SE_APLICA") continue;
    possible += item.points;
    if (answer === "TEM") earned += item.points;
  }
  return { earned, possible };
}
