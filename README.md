# Wallet Frontend

Este repositório contém a interface web (frontend) da aplicação Wallet AI — uma dashboard Next.js para gerenciar investimentos, ver recomendações e análise de carteira.

Este README explica a estrutura do projeto, como rodar localmente (Windows / cmd.exe) e dicas rápidas de debug.

## Descrição

Projeto em Next.js com TypeScript e Tailwind CSS. Utiliza React Query (@tanstack/react-query v5) para fetch/cache de dados e uma API backend separada (por padrão em http://localhost:3001).

O frontend contém páginas para login, dashboard, investimentos, perfil e integrações com provedores (ex.: Pluggy). Também inclui módulos para Análise de Carteira, Recomendações e Prévia de Rebalanceamento.

## Estrutura principal

- `pages/` - páginas do Next.js (router baseado em pages): `index.tsx`, `investments.tsx`, `dashboard.tsx`, etc.
- `src/components/` - componentes React reutilizáveis. Subpastas notáveis:
  - `components/investments/` - cards e skeletons de investimento
  - `components/portfolio/` - componentes de alocação, gaps e rebalance (ex.: `GapChip`, `AllocationDonut`, `RecommendationsRail`, `RebalanceModal`)
  - `components/ui/` - inputs e utilitários de UI
- `src/hooks/` - hooks customizados (ex.: `useApi`, `usePortfolioAnalysis`, `useInvestments`)
- `src/lib/` - utilitários e clientes (ex.: `api.ts`, `telemetry.ts`, `firebase.ts`)
- `src/services/` - serviços que encapsulam chamadas a APIs externas (ex.: `pluggyService.ts`, `authService.ts`)
- `src/types/` - definições TypeScript usadas por todo o projeto (recomendações, investimentos, etc.)
- `src/utils/` - funções utilitárias (formatação, mapeamentos)
- `public/` - assets públicos (imagens, ícones)

## Requisitos

- Node.js (versão compatível com o projeto; use uma versão LTS atual, por exemplo 18+)
- npm ou yarn
- API backend rodando (padrão: http://localhost:3001). Se você não tiver o backend, algumas páginas que dependem de dados remotos mostrarão estados vazios ou erros.

## Variáveis de ambiente importantes

- `NEXT_PUBLIC_API_URL` — URL base do backend (ex.: `http://localhost:3001`). Se não definida, o frontend usa `http://localhost:3001` por padrão.

Observação: a autenticação atual usa um token em `localStorage` com a chave `authToken`. Se tiver problemas de 401, verifique se o token está salvo corretamente e se o backend espera a mesma chave/contrato.

## Como rodar (Windows - cmd.exe)

1. Instale dependências:

```cmd
npm install
```

2. Configure variáveis de ambiente (opcional). Por exemplo, crie um arquivo `.env.local` com:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Rode em modo desenvolvimento:

```cmd
npm run dev
```

4. Abra no navegador: `http://localhost:3000`

Comandos úteis (se presentes no `package.json`):

- `npm run dev` — inicia Next.js em modo desenvolvimento
- `npm run build` — build de produção
- `npm start` — inicia servidor Next (após build)
- `npm run lint` — executa lint (se configurado)

## Observações de arquitetura e escolhas

- React Query (v5) é usado para fetch e gerenciamento de cache. Garanta que o `QueryClientProvider` esteja registrado em `_app.tsx`.
- O projeto usa TypeScript para tipos. Historicamente houve validação com Zod em algumas versões, mas a base atual está usando interfaces TypeScript e não depende de validação Zod no runtime.

## Dicas rápidas de debugging (erros comuns encontrados)

- Erro: `TypeError: Cannot convert undefined or null to object` ao usar `Object.keys(...)` em `investments.tsx` — Isso acontece quando a resposta da API (`portfolioAnalysis`) vem incompleta (por exemplo: `target_allocation` undefined). Solução rápida: verifique se `portfolioAnalysis` e suas propriedades (`target_allocation`, `current_allocation`, `gaps`) estão definidas antes de iterar. O componente já tem condicionais; se aparecer, confirme o payload retornado pelo backend.

- Erro 401 Unauthorized: verifique:

  - Se `localStorage` contém o `authToken` correto e o backend espera o mesmo campo.
  - Se `NEXT_PUBLIC_API_URL` aponta para o backend correto e porta (muitas vezes `3001`).

- Erros de validação (Zod): se você encontrar mensagens de validação Zod, pode ser que existam endpoints/handlers ainda esperando schemas. No estado atual do projeto, a preferência é usar interfaces TypeScript; alinhe payloads do backend ao contrato definido em `src/types/`.


```

