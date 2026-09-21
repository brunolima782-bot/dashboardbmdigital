# Dashboard de Tráfego Pago

Sistema web completo para agências de tráfego pago gerenciarem clientes, registrarem investimentos em **Meta Ads**, **Google Ads** e **LinkedIn Ads**, acompanharem métricas em dashboards profissionais e gerarem **relatórios em PDF** personalizados para cada cliente.

---

## 1. Stack utilizada

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | **Next.js 14** (App Router) + **React 18** | SSR/CSR híbrido, rotas de API integradas |
| Linguagem | **TypeScript** | tipagem em todo o projeto |
| Estilo | **Tailwind CSS** | design system próprio (cards, botões, inputs) |
| Gráficos | **Recharts** | gráficos de pizza, linha e barras |
| Ícones | **lucide-react** | ícones profissionais |
| Banco de dados | **SQLite** (via Prisma) | zero configuração local |
| ORM | **Prisma** | schema único, `provider` trocável para `postgresql` |
| Autenticação | **JWT em cookie httpOnly** (biblioteca `jose`) + `bcryptjs` | sessão de 7 dias |
| PDF | **jsPDF + html2canvas** | exportação client-side, sem dependências de servidor (Chromium) |
| CSV | **PapaParse** | importação com validação e prévia |
| Validação | **zod** | validação de payloads nas rotas de API |

### Por que essas escolhas?

- **SQLite + Prisma**: zero setup local (não precisa instalar Postgres). O `schema.prisma` já está pronto para migração: basta trocar `provider = "sqlite"` para `provider = "postgresql"` e ajustar `DATABASE_URL` no `.env`.
- **Autenticação própria com `jose`/`bcryptjs`** em vez de NextAuth: mantém o projeto simples, sem dependências externas de provedores OAuth, e funciona 100% local. A estrutura de `Role` (ADMIN/MANAGER/CLIENT) já está no schema para evolução futura.
- **jsPDF + html2canvas** em vez de Puppeteer: gera PDFs diretamente no navegador, sem precisar instalar Chromium/servidor headless — essencial para rodar localmente sem complicações.

---

## 2. Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org) 18 ou superior
- npm (instalado junto com o Node.js)

### Passo a passo

```bash
# 1. Entre na pasta do projeto
cd trafego-dashboard

# 2. Instale as dependências
npm install

# 3. Crie o banco de dados e aplique o schema
npm run db:push

# 4. Popule o banco com dados de demonstração (usuário admin + cliente exemplo)
npm run db:seed

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** no navegador.

> O arquivo `.env` já vem configurado com `DATABASE_URL="file:./dev.db"` — não é necessário nenhum banco externo.

---

## 3. Usuário de demonstração

| Campo | Valor |
|---|---|
| E-mail | `admin@agencia.com` |
| Senha | `admin123` |

O sistema já é criado com papéis (`ADMIN`, `MANAGER`, `CLIENT`) preparados para uma futura área exclusiva do cliente — hoje, apenas o papel `ADMIN` está habilitado no login.

---

## 4. Dados de demonstração

Ao rodar `npm run db:seed`, o sistema cria automaticamente:

- Um usuário administrador de testes
- **2 clientes fictícios**: *Mega Sol Piscinas* (Paulista/PE) e *Studio Bella Estética* (São Paulo/SP)
- Investimentos aleatórios nos últimos 2 meses em Meta Ads, Google Ads e (para o segundo cliente) LinkedIn Ads
- Orçamentos mensais de exemplo

Todos os registros de demonstração têm o campo `isDemo = true` no banco e uma observação identificando-os como **"Dado demonstrativo gerado automaticamente"**. Você pode excluí-los a qualquer momento pela tela de Investimentos.

Para resetar o banco e regerar os dados de demonstração a qualquer momento:

```bash
npm run db:reset
```

---

## 5. Fluxo de uso

```
Login → Dashboard da agência → Clientes → Selecionar cliente →
Dashboard do cliente → Lançar investimentos → Acompanhar métricas →
Gerar relatório → Exportar PDF
```

### 5.1. Cadastrar um cliente
1. Menu lateral → **Clientes** → **Novo cliente**
2. Preencha nome da empresa, responsável, segmento, cidade/estado e, opcionalmente, envie a logo e defina a cor da marca
3. Clique em **Cadastrar cliente**

### 5.2. Lançar um investimento
1. Menu lateral → **Investimentos** → **+ Adicionar investimento** (ou pelo botão dentro do dashboard do cliente)
2. Selecione o cliente, a plataforma (Meta/Google/LinkedIn), a data, o valor investido e a campanha
3. Opcionalmente, expanda **"+ Adicionar métricas detalhadas"** para informar impressões, cliques, leads, conversões e valor de conversão — o sistema calcula CTR, CPC, CPM, CPL e ROAS automaticamente
4. Clique em **Salvar**

### 5.3. Importar investimentos via CSV
1. Na tela **Investimentos**, clique em **Importar CSV**
2. Selecione o cliente de destino
3. Envie um arquivo `.csv` com as colunas: `Data` (DD/MM/AAAA), `Plataforma`, `Campanha`, `Investimento` e, opcionalmente, `Impressões`, `Cliques`, `Leads`, `Conversões`
4. O sistema mostra uma prévia com validação linha a linha antes de importar

### 5.4. Acompanhar o dashboard do cliente
1. Em **Clientes**, clique em **Ver Dashboard** no card do cliente desejado
2. Use o seletor de período (Hoje, 7 dias, 30 dias, mês atual, mês anterior ou personalizado)
3. Acompanhe investimento total, investimento por plataforma, orçamento utilizado, evolução de investimento/leads/CPL e comparativo entre plataformas

### 5.5. Gerar relatório e exportar PDF
1. Menu lateral → **Relatórios**
2. Selecione cliente, período e plataformas desejadas → **Gerar relatório**
3. Revise o relatório (resumo executivo, gráficos, performance por plataforma, insights e recomendações automáticas)
4. Clique em **Exportar PDF** — o arquivo é baixado com cabeçalho, rodapé e numeração de página

> Os insights e recomendações são gerados **exclusivamente a partir dos dados cadastrados** — o sistema nunca inventa números ou conclusões.

### 5.6. Configurações da agência
Menu lateral → **Configurações**: altere o nome da agência e a logo exibida no menu, no topo e nos relatórios.

---

## 6. Estrutura do projeto

```
trafego-dashboard/
├── prisma/
│   ├── schema.prisma        # modelos: User, Client, Investment, Budget, Campaign, Report, AgencySettings
│   └── seed.ts               # dados demonstrativos
├── public/
│   └── uploads/               # logos enviadas (clientes e agência)
├── src/
│   ├── app/
│   │   ├── login/             # tela de login
│   │   ├── (app)/              # área autenticada (layout com sidebar + topbar)
│   │   │   ├── dashboard/       # visão geral da agência
│   │   │   ├── clientes/        # listagem, cadastro, edição e dashboard individual
│   │   │   ├── investimentos/    # lançamento, filtros e importação CSV
│   │   │   ├── relatorios/       # seleção e geração de relatório + exportação PDF
│   │   │   └── configuracoes/    # identidade da agência
│   │   └── api/                # rotas de API (auth, clients, investments, budgets, settings, upload)
│   ├── components/
│   │   ├── layout/             # Sidebar, Topbar
│   │   ├── ui/                  # StatCard, Badge, ConfirmDialog, EmptyState, PeriodSelector, BudgetBar...
│   │   ├── charts/               # gráficos Recharts reutilizáveis
│   │   ├── clients/               # formulário e listagem de clientes
│   │   ├── investments/            # modais de lançamento e importação CSV
│   │   ├── reports/                 # seletor de relatório, card de performance, botão de exportar PDF
│   │   └── providers/                # ToastProvider (mensagens de sucesso/erro)
│   ├── lib/
│   │   ├── prisma.ts            # client singleton
│   │   ├── auth.ts               # sessão JWT
│   │   ├── metrics.ts             # CTR, CPC, CPM, CPL, CPA, ROAS
│   │   ├── period.ts               # resolução de períodos (hoje, 7d, 30d, mês, personalizado)
│   │   ├── insights.ts              # geração de insights e recomendações automáticas
│   │   ├── formatters.ts             # formatação em pt-BR (moeda, número, data, percentual)
│   │   └── pdf.ts                     # exportação de elemento HTML para PDF paginado
│   └── middleware.ts             # proteção de rotas autenticadas
├── .env                        # DATABASE_URL e AUTH_SECRET
└── package.json
```

---

## 7. Cálculo de métricas

| Métrica | Fórmula |
|---|---|
| CTR | Cliques ÷ Impressões × 100 |
| CPC | Investimento ÷ Cliques |
| CPM | Investimento ÷ Impressões × 1000 |
| CPL (Custo por Lead) | Investimento ÷ Leads |
| CPA (Custo por Conversão) | Investimento ÷ Conversões |
| ROAS | Valor de conversão ÷ Investimento |

Todos os cálculos ficam centralizados em [src/lib/metrics.ts](src/lib/metrics.ts) e são aplicados de forma consistente no dashboard, na tabela comparativa e nos relatórios.

---

## 8. Segurança e isolamento de dados

- Todas as rotas (exceto `/login`) são protegidas por `middleware.ts`, que valida o cookie de sessão (JWT assinado).
- Toda consulta de investimentos, orçamentos e relatórios é filtrada por `clientId`, garantindo que os dados de um cliente nunca apareçam misturados com os de outro.
- Senhas são armazenadas com hash `bcrypt` (nunca em texto puro).
- O modelo `User` já possui o campo `role` (`ADMIN`, `MANAGER`, `CLIENT`) e `clientId`, preparado para uma futura área restrita onde o cliente só visualiza seus próprios dados.

---

## 9. Backup do banco de dados

O banco SQLite é um único arquivo: `prisma/dev.db`. Para fazer backup, basta copiá-lo:

```bash
# Windows (PowerShell)
Copy-Item prisma\dev.db backups\dev-$(Get-Date -Format "yyyy-MM-dd").db

# Ou simplesmente copie o arquivo prisma/dev.db para um local seguro
```

Para restaurar, substitua `prisma/dev.db` pelo arquivo de backup e reinicie o servidor.

Para inspecionar/editar os dados visualmente, use o **Prisma Studio**:

```bash
npm run db:studio
```

---

## 10. Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run start` | Inicia o servidor em modo produção (após `build`) |
| `npm run db:push` | Aplica o schema Prisma ao banco SQLite |
| `npm run db:seed` | Popula o banco com dados de demonstração |
| `npm run db:reset` | Reseta o banco e reaplica os dados de demonstração |
| `npm run db:studio` | Abre o Prisma Studio (interface visual do banco) |

---

## 11. Migração futura para PostgreSQL

1. Suba uma instância PostgreSQL (local, Docker ou serviço em nuvem)
2. No `prisma/schema.prisma`, altere:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. No `.env`, defina `DATABASE_URL="postgresql://usuario:senha@host:5432/banco"`
4. Rode `npm run db:push` (ou crie migrations com `npx prisma migrate dev`)

Nenhuma outra alteração de código é necessária — o Prisma abstrai as diferenças de SQL entre os bancos.

---

## 12. Limitações conhecidas (escopo desta versão)

- O login autentica apenas o papel `ADMIN`; a área exclusiva de cliente (`role: CLIENT`) está modelada no banco, mas a tela ainda não foi implementada — é a próxima evolução natural do sistema.
- A importação de CSV é feita inteiramente no navegador (sem persistência do arquivo original).
- O envio de logos salva os arquivos em `public/uploads`; em um ambiente de produção real, recomenda-se usar um serviço de armazenamento de objetos (S3, Cloudinary etc.).
