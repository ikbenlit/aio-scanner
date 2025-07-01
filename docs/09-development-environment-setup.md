# Development Environment Setup & Coding Standards

This document outlines the coding standards and provides guidance on setting up the development environment, including known issues and workarounds.

## 1. Development Environment (WSL on Windows)

This project is developed on a Windows machine using the Windows Subsystem for Linux (WSL). This hybrid setup can lead to specific challenges that developers should be aware of.

### Known Issues & Workarounds

#### **Toolchain & Dependency Conflicts**

-   **Problem**: The build toolchain (Vite/Rollup) might try to use Windows-specific optional dependencies (e.g., `@rollup/rollup-win32-x64-msvc`) within the Linux subsystem. This can cause `npm install` to fail or result in persistent linter/compiler errors.
-   **Symptom**: Errors like `Cannot find module @rollup/rollup-win32-x64-msvc`.
-   **Workaround**: If you encounter persistent dependency-related errors, perform a clean reinstall of the node modules:
    1.  Delete the `node_modules` directory.
    2.  Delete the `package-lock.json` file.
    3.  Run `npm install` again from your WSL terminal.

#### **Automated Tooling & AI Assistants**

-   **Problem**: The interaction between the WSL file system layer and the underlying Windows file system can confuse automated tools, including AI coding assistants.
-   **Symptom**: An AI assistant might fail to apply code changes automatically, even if the suggested code is correct. It might require multiple attempts or manual application of the changes.
-   **Workaround**: If an automated change fails, be prepared to apply the code modification manually as instructed. Patience is key.

---

## 2. Coding Standards

### TypeScript
- Gebruik strikte type checking **in production**
- **MVP Exception:** `any` type toegestaan voor snelle prototyping en external library issues
- Definieer interfaces voor alle objecten **waar praktisch**
- Gebruik type guards waar nodig
- Exporteer types en interfaces
- **Refactor regel:** `any` types documenteren met TODO comments voor later cleanup

### Context-Aware Standards

#### MVP/Prototype Phase
- Focus op werkende functionaliteit over perfecte types
- `any` types toegestaan met documentatie waarom
- Snelle iteratie over code perfectie
- Basis error handling voldoende

#### Production Phase  
- Strikte type checking vereist
- Comprehensive error handling
- Volledige test coverage
- Performance optimalisatie

### Svelte
- Gebruik functionele componenten waar mogelijk.
- Volg de standaard Svelte-conventies voor props, events en state management.
- Gebruik Svelte stores voor cross-component state management.

### Styling
- Gebruik Tailwind CSS voor styling
- Volg BEM-achtige naming voor custom classes waar nodig
- Gebruik `app.css` voor globale stijlen
- Implementeer responsive design
- Volg design system kleuren en spacing

### State Management
- Gebruik Svelte stores voor globale UI state.
- Voor server state, wordt data direct gefetcht in `+page.svelte` of `+page.server.ts`.
- Vermijd prop drilling door gebruik te maken van stores of context.

### API & Data
- **MVP:** Direct `fetch` calls naar API-endpoints zijn toegestaan voor snelheid.
- Implementeer error handling (basis niveau voor MVP).
- Gebruik `zod` voor validatie **waar kritiek**.
- Cache responses waar mogelijk.
- Implementeer rate limiting op gevoelige endpoints.

### Testing
- **MVP:** Focus op manual testing en kritieke flows via de `/api/test/...` endpoints.
- **Production:** Schrijf unit tests voor utilities en integration tests voor API calls.

### Performance
- **MVP:** Basis optimalisatie (geen premature optimization).
- **Production:** Implementeer code splitting, optimaliseer bundle size, gebruik image optimalisatie en implementeer caching strategieën.

### Code Organization Principles

#### DRY (Don't Repeat Yourself)
- **MVP:** Copy-paste toegestaan voor snelheid, refactor later.
- Hergebruik code via shared utilities in `$lib/utils` **waar obvious**.
- Maak herbruikbare componenten **na pattern emergence**.
- Centraliseer business logic in services of orchestrators (e.g., `ScanOrchestrator`).

#### SOC (Separation of Concerns)
- Scheid UI (`$lib/components`) van business logic (`$lib/scan`, `$lib/pdf`, etc.).
- Houd componenten klein en gefocust.
- Gebruik een feature-based mappenstructuur in `src/routes` en `$lib/components`.
- **MVP:** Monolithic components toegestaan voor snelheid.
- Scheid data fetching van rendering (SvelteKit `+page.ts` en `+page.server.ts` helpen hierbij).

### Phase Transition Guidelines

#### MVP → Production Checklist
- [ ] Replace all `any` types with proper interfaces
- [ ] Add comprehensive error handling
- [ ] Implement proper testing suite
- [ ] Add performance optimizations
- [ ] Refactor duplicated code
- [ ] Add proper validation layers
- [ ] Implement security measures (e.g., RLS in Supabase)
- [ ] Add monitoring and logging

### Technical Debt Management
- Document all MVP shortcuts with TODO comments.
- Track technical debt in een issue tracker of document.
- Allocate 20% of post-MVP time to cleanup.
- Prioritize refactoring based on usage patterns. 