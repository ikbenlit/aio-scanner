# CLAUDE.md

Context voor Claude bij het werken met dit SvelteKit AIO Scanner project.

## 🏗️ Project Essentials

**AIO Scanner**: AI-powered SEO scanning tool
- **Tech Stack**: SvelteKit v2 + TypeScript + Tailwind + Shadcn-Svelte
- **Backend**: Supabase (PostgreSQL + RLS) + Vertex AI (Gemini)
- **Payments**: Mollie API | **Email**: Resend | **Deploy**: Vercel

## 🚀 Development Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run check         # Type checking
npm run test          # Run tests
```

## 📁 Key Architecture

### Scan Engine (Core Business Logic)
- **Tiers**: Basic (free) → Starter (€19.95) → Business (€49.95) → Enterprise (€149.95)
- **Files**: `src/lib/scan/ScanOrchestrator.ts` + `src/lib/scan/modules/`
- **Database**: `users`, `scans`, `scan_modules` tables

### AI Integration
- **Service**: Google Vertex AI (Gemini 2.0 Flash)
- **Auth**: Service account via `GOOGLE_APPLICATION_CREDENTIALS`
- **Region**: europe-west1

### Payment & Email
- **Mollie**: Credit-based purchases (no subscriptions)
- **Resend**: Transactional emails
- **Webhooks**: Payment confirmation handling

## 🎯 Development Standards

### MVP Phase (Current)
- Pragmatic shortcuts OK for rapid prototyping
- `any` types permitted (document with TODO)
- Copy-paste acceptable (refactor later)
- Manual testing sufficient

### Code Quality
- **DRY**: Hergebruik bestaande helpers
- **SoC**: Max 1 verantwoordelijkheid per module
- **MVP-first**: Werkend skelet, dan uitbreiden
- **Tests**: In `**/_test_/` of `tests/**`, nooit in `src/`
- **Project-libs**: Gebruik project-libs voor I/O en config, niet zelf herimplementeren

### TypeScript Guidelines
- Strict typing in production
- Export interfaces voor shared types
- Document `any` usage met TODO comments
- Type guards voor external data

## 🔧 Environment Variables

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json
# Plus Mollie, Resend API keys
```

## 📂 Component Structure

```
src/lib/components/
├── core/           # Scan-specific components
├── features/       # Feature-based components
├── layout/         # Layout components
└── ui/             # Shadcn-Svelte base components
```

## 🔐 Security & Performance

- **Input Validation**: Zod schemas
- **Database**: Supabase RLS policies
- **Rate Limiting**: API endpoints
- **Performance**: Code splitting, image optimization, query optimization

## 📊 Testing Strategy

**MVP**: Manual testing voor critical flows
**Production**: Unit tests (utilities) + Integration tests (API) + E2E tests (journeys)

## 💡 Development Tips

1. **Mobile-first** responsive design
2. **Credit system** voor payment flow
3. **Scan results** stored as JSON in Supabase
4. **URL handling** via SvelteKit's `$app` stores
5. **Real-time updates** via polling of Supabase tables