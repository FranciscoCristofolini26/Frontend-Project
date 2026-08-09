# AgendaFrontend

Frontend Angular de um app de agenda/produtividade pessoal (planner diário/semanal, tarefas, hábitos, metas, notas, projetos, calendário, arquivos). Backend é um serviço HTTP separado (não está neste repo) — hoje só `NotesService` consome API real (`http://localhost:8080/notes`); as demais páginas ainda operam com dados mockados/locais no componente.

## Stack

- **Angular 22** (standalone components, sem NgModules) + **Angular CLI**
- **Angular Material** (`@angular/material`, `@angular/cdk`) para UI, `material-symbols` para ícones
- **Tailwind CSS 4** (via `@tailwindcss/postcss`) + CSS puro por componente (`*.css` ao lado de cada `*.ts`/`*.html`)
- **RxJS** para streams/HTTP
- **animejs** para animações (motivo dos `esModuleInterop`/`allowSyntheticDefaultImports` no tsconfig)
- **TypeScript strict mode** ligado (strict, noImplicitOverride, noImplicitReturns, noFallthroughCasesInSwitch, noPropertyAccessFromIndexSignature)
- **Vitest** como test runner (`ng test`), **ESLint** (`angular-eslint` + `typescript-eslint` + `eslint-config-prettier`), **Prettier**
- Sem NgRx nem store global — estado é local a cada componente/serviço (ver `sidebar-state.ts`, `theme.service.ts`)

## Comandos

```bash
npm start      # ng serve — dev server em http://localhost:4200
npm run build  # ng build — saída em dist/AgendaFrontend
npm run watch  # build com watch, configuração development
npm test       # ng test (Vitest)
npm run lint   # ng lint
```

Não há testes e2e configurados.

## Estrutura

```
src/app/
  app.ts / app.html / app.routes.ts / app.config.ts   # root standalone component, rotas, providers (HttpClient, Router)
  pages/            # uma pasta por feature/rota (component + .html + .css, às vezes models/ e service/ próprios)
    home, login, habits, goals, notes, calendar, files, projects, config
    schedule/       # feature mais complexa: planner diário/semanal
      components/   # subcomponentes do planner (day-view, week-view, event-card, event-form,
                     #   sidebar, summary-card, habits-card, free-time-card, overlap-accordion,
                     #   unscheduled-tasks, next-activity-card, daily-summary, header, tasks, planning)
      models/        # PlannerEvent, PlannerTask, PlannerHabit, Task, TaskPriority, layout-tier, planner.utils
  shared/           # header, sidebar, main-layout (shell da aplicação), theme.service (dark/light)
  styles/           # buttons/cards/inputs/modal css utilitários + themes/colors.css + utilities/animations.css
```

- Rotas registradas em [app.routes.ts](src/app/app.routes.ts): `home`, `login`, `habits`, `goals`, `notes`, `calendar`, `files`, `projects`, `schedule` — sem guards nem lazy loading até o momento.
- Cada página é standalone; imports centralizados de páginas via [pages/index.ts](src/app/pages/index.ts).
- Padrão de nomes de arquivo: PascalCase para models/services isolados dentro de uma feature (ex.: `NoteModel.ts`, `NoteService.ts`), kebab/lowercase para os demais arquivos Angular padrão (`*.ts`, `*.html`, `*.css` do componente).

## Convenções (eslint.config.js)

- Seletor de componente: `app-` + kebab-case
- Seletor de diretiva: `app` + camelCase
- Templates passam por `angular-eslint` (`templateRecommended` + `templateAccessibility`) — cuidado com acessibilidade nos `.html`

## Domínio (schedule/models)

- `PlannerEvent` / `PlannerEventDraft`: evento no planner (categoria: work/study/personal/event/habit, kind: event/task)
- `PlannerTask`, `PlannerHabit`: itens auxiliares do dia (tarefas/hábitos ligados ao planner)
- `Task` (em `models/task.ts`): tarefa "genérica" com `TaskPriority` (Alta/Média/Normal) e `TaskPeriod` (hoje/proximas/mais-tarde) — usada fora do contexto estrito do planner
- `PositionedPlannerEvent` / `PlannerOverlapGroup`: suporte de layout para renderizar eventos sobrepostos lado a lado (ver `planner.utils.ts`)

Textos de domínio (labels, prioridades) estão em **português** — manter esse idioma ao adicionar novos campos/enum de domínio.

## Coisas a notar para quem for investigar/mexer no projeto

- **Não há autenticação real**: existe uma página `login` mas sem guard de rotas nem serviço de auth ligado — não assumir que rotas são protegidas.
- **Dados majoritariamente mockados**: só `notes` fala com um backend HTTP; outras páginas (habits, goals, schedule, projects, calendar, files) provavelmente têm dados fixos no próprio componente — confirmar por página antes de assumir uma API existente.
- **Sem NgModules**: tudo standalone; ao criar componente novo, seguir o padrão de `imports: [...]` direto no `@Component`.
- **CSS por componente + Tailwind + design tokens em `styles/`**: antes de estilizar algo novo, checar `styles/themes/colors.css` e `styles/components/*.css` para reaproveitar classes utilitárias existentes em vez de duplicar.
- **Tema dark/light**: gerenciado por `shared/theme.service.ts`.
- **Feature `schedule`** é a mais densa do repo (12 subcomponentes) — ao investigar bugs de UI de calendário/planner, começar por `schedule.ts` e `planner.utils.ts` (lógica de overlap/posicionamento).
