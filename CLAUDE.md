# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIO Scanner is a SvelteKit-based AI-powered SEO scanning tool that analyzes websites and provides comprehensive reports. The system uses Supabase for database/auth, Vertex AI for analysis, and supports tiered scanning with payment integration via Mollie.

## Development Commands

```bash
# Development
npm run dev                 # Start development server
npm run dev -- --open      # Start dev server and open browser

# Build & Preview
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run check             # Run Svelte type checking
npm run check:watch       # Run type checking in watch mode
npm run prepare           # Sync SvelteKit (auto-run on install)
```

## Architecture & Tech Stack

- **Frontend**: SvelteKit v2 + TypeScript + Tailwind CSS + Shadcn-Svelte
- **Backend**: SvelteKit API routes + Supabase (PostgreSQL with RLS)
- **AI**: Google Vertex AI (Gemini models) for content analysis
- **Payments**: Mollie API for iDEAL/credit card processing
- **Email**: Resend for transactional emails
- **Deployment**: Optimized for Vercel

## Core System Components

### Scan Engine Architecture
The scan system operates on a tiered model:
- **Basic**: TechnicalSEO + SchemaMarkup modules (free)
- **Starter**: Basic + AIContent + AICitation modules (€19.95)
- **Business**: Starter + Versheid + CrossWebFootprint modules (€49.95) 
- **Enterprise**: Business + additional features (€149.95)

Key files:
- `src/lib/scan/ScanOrchestrator.ts` - Main orchestration logic
- `src/lib/scan/modules/` - Individual scan modules
- `src/lib/scan/types.ts` - Type definitions

### Database Schema
Core tables: `users`, `scans`, `scan_modules`
- User tracking with credit system
- Scan results stored as JSON
- Module-level progress tracking

Access via:
- `src/lib/supabase.ts` - Client setup and helpers
- `src/lib/types/database.ts` - Type definitions

### AI Integration
Vertex AI integration for content analysis:
- Service account authentication
- Gemini 2.0 Flash model usage
- Region: europe-west1

Key files:
- `src/lib/ai/vertexTest.ts` - Authentication testing
- Modules use AI for SEO analysis

## Development Standards

### MVP vs Production Approach
Currently in MVP phase - pragmatic shortcuts allowed:
- `any` types permitted for rapid prototyping (document with TODO)
- Copy-paste code acceptable (refactor later)
- Basic error handling sufficient
- Manual testing over comprehensive test suites

### TypeScript Guidelines
- Use strict typing in production
- Export interfaces for shared types
- Document `any` usage with TODO comments for cleanup
- Type guards for external data

### Component Architecture
- Feature-based folder structure under `src/lib/components/`
- Shadcn-Svelte for base UI components
- Custom components for scan visualizations
- Mobile-first responsive design

## Environment Configuration

Required environment variables:
- `PUBLIC_SUPABASE_URL` - Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON
- Various API keys for Mollie, Resend, etc.

## Testing Strategy

Current MVP approach:
- Manual testing for critical flows
- API endpoint testing via `/api/test/` routes
- Focus on scan accuracy and payment flow

Production requirements:
- Unit tests for utilities
- Integration tests for API calls
- E2E tests for critical user journeys

## Payment Integration

Mollie-based system:
- Credit-based purchases (no subscriptions)
- iDEAL, credit card, SEPA support
- Webhook handling for payment confirmation
- Credits stored in Supabase with RLS

Key files:
- `src/routes/api/payment/` - Payment endpoints
- `src/lib/payment/verificationService.ts` - Payment verification

## Email System

Resend integration for:
- Scan completion notifications
- Report delivery
- Payment confirmations

Key files:
- `src/lib/email/` - Email utilities and templates
- Rate limiting and monitoring included

## Performance Considerations

- Code splitting for production builds
- Image optimization via Vercel
- Database query optimization
- Scan result caching strategies

## Security Implementation

- Input validation with Zod schemas
- Supabase RLS policies
- API rate limiting
- Secure environment variable handling