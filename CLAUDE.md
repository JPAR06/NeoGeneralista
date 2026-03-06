# NeoGeneralista — Project Overview

## What this is
A Next.js 14 website for **NeoGeneralista**, a creative content studio by Rafaela Mota Lemos.
The site also hosts **AlgoritmoHumano**, a monthly event series about humans and AI.

The teacher/owner (Rafaela) manages all content through **Sanity CMS** — no code editing required.
Newsletter subscriptions are handled via **Sender** (sender.net).

## Stack
- **Framework:** Next.js 14 (Pages Router)
- **Styling:** Plain CSS (`styles/globals.css`)
- **CMS:** Sanity (free tier) — content managed at `sanity.io/manage`
- **Newsletter:** Sender (sender.net) — subscriber list managed there
- **Deployment:** Node.js server (VPS), `npm run build && npm start`

## Directory structure
```
/
├── components/
│   ├── NeoGeneralista.jsx        # Homepage component
│   ├── AlgoritmoHumanoV2.jsx     # AlgoritmoHumano event page (current)
│   └── AlgoritmoHumano.jsx       # AlgoritmoHumano event page (legacy v1)
├── pages/
│   ├── index.js                  # NeoGeneralista homepage
│   ├── algoritmo-humano-v2.js    # AlgoritmoHumano page (current)
│   ├── algoritmo-humano.js       # Legacy v1 page
│   ├── _app.js
│   ├── _document.js
│   └── api/
│       └── subscribe.js          # Newsletter subscription endpoint (Sender)
├── sanity/                       # Sanity CMS config and schemas
│   ├── sanity.config.js
│   ├── sanity.cli.js
│   └── schemaTypes/
│       ├── index.js
│       ├── conversa.js
│       ├── eventoProximo.js
│       ├── membroEquipa.js
│       ├── membroComunidade.js
│       ├── patrocinador.js
│       ├── configuracoes.js
│       ├── servico.js
│       └── logoCliente.js
├── lib/
│   └── sanity.js                 # Sanity client + GROQ query helpers
├── styles/
│   └── globals.css
├── .env.local                    # Secret keys (NOT committed to git)
└── CLAUDE.md                     # This file
```

## Environment variables
Create a `.env.local` file at the project root (never commit this):
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SENDER_API_KEY=your_sender_api_key
SENDER_LIST_ID=your_sender_list_id
```

## Running locally
```bash
npm install
npm run dev       # Development server at http://localhost:3000
```

## Building for production
```bash
npm run build
npm start
```

## Git workflow — ALWAYS follow this

1. **Never commit directly to `main`**. Main is the stable, deployed branch.
2. **Create a branch** for every change:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```
3. **Commit often** — after each meaningful step, not just at the end:
   ```bash
   git add <specific-files>
   git commit -m "type: short description"
   ```
   Commit message types: `feat` (new feature), `fix` (bug fix), `docs` (documentation), `style` (CSS/visual), `refactor`, `chore` (setup/config)
4. **Push your branch** when ready:
   ```bash
   git push -u origin feature/your-feature-name
   ```
5. **Open a Pull Request** on GitHub to merge into `main`. Review before merging.

## Content management (for Rafaela)
All content is managed at: https://sanity.io/manage
- Log in with the project account
- Edit Conversas, Evento, Equipa, Patrocinadores, etc.
- Changes go live on the site within ~60 seconds (no redeploy needed)

## Newsletter (Sender)
Subscribers are managed at: https://app.sender.net
- View subscriber lists, send campaigns, check analytics there
