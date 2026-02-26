# Sistema de Chamados — TechSupport

Um sistema de chamados moderno, multi-empresa e orientado a SLA — construído com Next.js, Prisma e carinho.

Resumo rápido
- Propósito: gestão de chamados (criação, atribuição, acompanhamento, rating e SLA).
- Multi-empresa: suporte a várias empresas e permissões por função (administrador, atendente, cliente, admin da empresa).
- Tecnologias principais: Next.js 15, React 19, Prisma (Postgres), Tailwind CSS, Cloudinary (uploads), NextAuth (credenciais), Nodemailer.

Principais features
- Painéis separados: `Administrador`, `Atendente`, `Colaborador`.
- Fluxo completo de tickets: criação, triagem, atribuição, atualizações e avaliação.
- SLA: prazos de resposta/solução por tipo de ticket e deadlines armazenados no banco.
- Upload de arquivos via Cloudinary.
- Autenticação com `next-auth` (provider de credenciais) e senha com `bcryptjs`.
- Templates de e-mail prontos em `/_email-templates`.

Estrutura importante
- [package.json](package.json)
- [prisma/schema.prisma](prisma/schema.prisma)
- [app](app) — rotas e páginas (inclui `dashboard/*`, `api/*`, e páginas públicas)
- [components](components) — componentes reutilizáveis e datatables
- [lib/auth.ts](lib/auth.ts) — configuração do `next-auth` (CredentialsProvider)
- [lib/prisma.ts](lib/prisma.ts) — instância do Prisma Client
- [lib/nodemailer.ts](lib/nodemailer.ts) — transporte de e-mail
- [lib/cloudinary-config.ts](lib/cloudinary-config.ts) — configuração Cloudinary
- [/_template](/_template) — layouts por tipo de usuário
- [_email-templates](/_email-templates) — templates de e-mail (reset, novo chamado, etc.)

Instalação (rápido)
1. Clone o projeto

```bash
git clone <repo> && cd sistema_chamado
```

2. Instale dependências (recomendo `pnpm`):

```bash
pnpm install
```

3. Crie o arquivo `.env` (base) com as variáveis listadas abaixo.

4. Inicialize o banco e gere o client Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Rode a aplicação em desenvolvimento:

```bash
pnpm dev
```

Scripts úteis
- `pnpm dev` — roda o Next.js em modo desenvolvimento
- `pnpm build` — build para produção (`next build`)
- `pnpm start` — inicia o build em produção
- `pnpm lint` — executa o lint

Variáveis de ambiente (mínimo recomendado)
- `DATABASE_URL` — string de conexão PostgreSQL
- `NEXTAUTH_SECRET` — segredo do NextAuth
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — configurações SMTP usadas por `lib/nodemailer.ts`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary
- (opcional) `NEXT_PUBLIC_VERCEL_URL` ou URL pública para links em e-mails

Observações de implantação
- Configure um banco Postgres gerenciado (Heroku, Railway, Supabase, Neon etc.) e atualize `DATABASE_URL`.
- Defina `NEXTAUTH_SECRET` com um valor seguro (por exemplo, `openssl rand -hex 32`).
- Configure variáveis SMTP e Cloudinary no provedor (Vercel, Railway).

Como criar um usuário administrador rápido
1. Rode `npx prisma studio` e crie um `Company` e um `User` com `role = ADMINISTRADOR` (senha deve ser **hash** — se preferir, crie via script ou endpoint de seed).

Dicas de desenvolvimento
- Use o painel de [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio) para inspecionar dados: `npx prisma studio`.
- Os templates de e-mail ficam em `/_email-templates` e são renderizados com `@react-email`.
- Uploads usam `next-cloudinary` + `cloudinary` (veja `lib/cloudinary-config.ts`).

Boas práticas e melhorias sugeridas
- Adicionar um script de `seed` para popular empresas, roles e um admin inicial.
- Cobrir lógicas críticas com testes (autenticação, criação de tickets, regras de SLA).
- Adicionar monitoramento (Sentry) e checagens de saúde para integrações externas (SMTP, Cloudinary, DB).

Contribuição
- Fork, branch feature/bugfix e PR. Respeite o padrão de commits e adicione descrições claras.

Contato e créditos
[Búzios Digital](https://buzios.digital)

- _Project Owner_ - [André Luis Castro](https://github.com/andreluisfcpn)
- _Mid-Level FullStack Developer_ - [Mike Santos](https://github.com/mfonsanBD)

Divirta-se construindo e melhorando — este projeto está bem estruturado para crescer!
